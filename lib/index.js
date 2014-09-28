'use strict';

var inherits = require('util').inherits
var express = require('express')
var path = require('path')
var fs = require('fs')
var http = require('http')
var io = require('socket.io-client')
var colorful = require('colorful')
var utilx = require('utilx')

var logger = require('./logger')
var handleCfg = require('./handle-cfg')
var report = require('./report')
var getRepo = require('./get-repo')
var tgz = require('./tgz')

var clientHost = utilx.getExternalIpAddress()
var clientPort = 9998


module.exports = Client


function Client(cfg) {
  var that = this
  this.cfg = handleCfg(cfg)
  this.report = cfg.report || report
  ;delete cfg.report

  if (cfg.root) {
    this.launchServer(function() {
      that.launchTest()
    })
  } else {
    this.launchTest()
  }
}

Client.prototype.launchServer = function(callback) {
  var that = this
  var cfg = this.cfg
  var root = cfg.root

  process.chdir(root)

  var app = express()
  app.use(express.query())
  app.use(tgz({root: root}))
  app.use(express.static(root))

  this.server = app.listen(clientPort, clientHost, function() {
    logger.debug('Start client server <', clientHost + ':' + clientPort, '>')
    callback()

  })

  this.server.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      logger.debug('Port <', clientPort, '> is in use, will auto find another one.')
      clientPort = randomPort()
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

      cfg.repo = repo
      cfg.version = version

      if (cfg.root) {
        var prefix = 'http://' + clientHost + ':' + clientPort + '/'
        cfg.runner = prefix + relative(cfg.root, cfg.runner)
        if (utilx.isExistedFile(cfg.adapter)) cfg.adapter = prefix + relative(cfg.root, cfg.adapter)
      }
      logger.debug('Handled config', cfg)

      socket.emit('init', cfg)
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
          if (!Array.isArray(info)) {
            info = [info];
          }
          logger[action].apply(logger, info)
          break
        case 'endAll':
        case 'timeout':
          var rt = that.report(info)
          that.destroy(rt ? 0 : 1)
          break
        default:
          break
      }
    })
  })

  socket.on('proxyReq', function(info) {
    var opts = {
      hostname: clientHost,
      port: clientPort,
      path: info.path,
      headers: info.headers
    }

    http.request(opts, function(res) {
      var totalLength = 0

      var bufs = [];
      res.on('data', function(data) {
        totalLength += data.length
        bufs.push(data);
      })

      res.on('end', function() {
        var body = Buffer.concat(bufs, totalLength)
        // socket.io not support Buffer until 1.0.0
        // need to transfer Buffer to bytes array
        var bytes = [];
        for (var i = 0; i < body.length; i++) {
          bytes[i] = body[i];
        }
        logger.info('proxyRes, path: %s, status: %s, body size: %s',
          info.path, res.statusCode, body.length)
        socket.emit('proxyRes', {
          path: info.path,
          statusCode: res.statusCode,
          headers: res.headers,
          body: bytes,
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

  // remove runner auto created by totoro when specified --code
  var cfg = this.cfg
  if (cfg.code) {
    process.on('exit', function() {
      var runnerPath = cfg.runner.replace(/https?:\/\/[^\/]+\//, '').replace('/', path.sep)
      if (fs.existsSync(runnerPath)) {
        fs.unlinkSync(runnerPath)
      }
    })
  }

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


function relative(from, to) {
  return path.relative(from, to).replace(path.sep, '/')
}
