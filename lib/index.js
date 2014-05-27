'use strict';

var inherits = require('util').inherits
var express = require('express')
var path = require('path')
var fs = require('fs')
var http = require('http')
var io = require('socket.io-client')
var common = require('totoro-common')
var colorful = require('colorful')

var logger = require('./logger')
var handleCfg = require('./handle-cfg')
var report = require('./report')
var getRepo = require('./get-repo')


module.exports = Client


function Client(cfg) {
  var that = this
  this.cfg = handleCfg(cfg)
  this.report = cfg.report || report

  if (cfg.root) {
    this.launchServer(function() {
      that.launchTest()
    })
  } else {
    this.launchTest()
  }

  // remove runner auto created by totoro when specified --code
  if (cfg.code) {
    process.on('exit', function() {
      if (fs.existsSync(cfg.runner)) {
        fs.unlinkSync(cfg.runner)
      }
    })
  }
}

Client.prototype.launchServer = function(callback) {
  var that = this
  var cfg = this.cfg
  var root = cfg.root

  process.chdir(root)

  var app = express()
  app.use(express.static(root))

  app.listen(cfg.clientPort, cfg.clientHost, function() {
    logger.debug('Start client server <', cfg.clientHost + ':' + cfg.clientPort, '>')
    callback()

  }).on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      logger.debug('Port <', cfg.clientPort, '> is in use, will auto find another one.')
      cfg.clientPort = randomPort()
      that.launchServer(callback)
    } else {
      throw e
    }
  })
}

Client.prototype.launchTest = function() {
  var that = this
  var cfg = this.cfg
  var socket = this.socket = io.connect(
      'http://' + cfg.host + ':' + cfg.port + '/__order')

  socket.on('connect', function () {
    var pkgFile = path.join(__dirname, '..', 'package.json')
    var version = JSON.parse(fs.readFileSync(pkgFile)).version

    getRepo(cfg.runner, function(repo) {
      logger.debug('Found repo <', repo, '>')

      function generateInitData(cfg) {
        var i, rt = {}, black = ['host', 'port', 'root']

        for (i in cfg) {
          if (black.indexOf(i) > -1) continue
          rt[i] = cfg[i]
        }

        rt.repo = repo
        rt.version = version
        return rt
      }

      socket.emit('init', generateInitData(cfg))
    })

  })

  socket.on('report', function(reports) {
    var labors = that.labors

    reports.forEach(function(report) {
      var action = report.action
      var info = report.info

      switch (action) {
        case 'debug':
        case 'info':
        case 'warn':
        case 'error':
          logger[action].apply(logger, info)
          break
        case 'autoBrowsers':
          logger.info('Specified browsers automatically', info)
          break
        case 'end':
          logger.info('Labor <', info.browser, '> finished order.')
          break;
        case 'endAll':
        case 'timeout':
          var rt = that.report(info, cfg)
          that.destroy(rt ? 0 : 1)
          break
        default:
          break
      }
    })
  })

  socket.on('proxyReq', function(info) {
    var opts = {
      hostname: cfg.clientHost,
      port: cfg.clientPort,
      path: info.path,
      headers: info.headers
    }

    http.request(opts, function(res) {
      var buffer = new Buffer(parseInt(res.headers['content-length'], 10))
      var offset = 0

      res.on('data', function(data) {
        data.copy(buffer, offset)
        offset += data.length
      })

      res.on('end', function() {
        socket.emit('proxyRes', {
          path: info.path,
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer
        })
      })

    }).on('error', function(err) {
      logger.warn('Proxy error <', err, '>')
      socket.emit('proxyRes', {
        path: info.path,
        statusCode: 500,
        body: err
      })

    }).end()
  })

  socket.on('error', function() {
    logger.error('Server is not available, please check your config or try again later.')
  })

  socket.on('disconnect', function() {
    logger.error('Server is interrupted, please try again later.')
  })

}

Client.prototype.destroy = function(code) {
  logger.debug('Client destroy.')
  code = code || 0
  process.exit(code)
}


Client.config = require('./config')
Client.list = require('./list')


function print(str, c) {
  str = str || ''
  str = c ? colorful[c](str) : str
  process.stdout.write(str)
}


function randomPort() {
  return Math.floor(Math.random() * 1000) + 7000
}
