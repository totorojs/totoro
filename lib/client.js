'use strict';

var inherits = require('util').inherits
var express = require('express')
var path = require('path')
var fs = require('fs')
var http = require('http')
var io = require('socket.io-client')
var common = require('totoro-common')
var logger = common.logger
var colorful = require('colorful')

var handleCfg = require('./handle-cfg')
var report = require('./report')

module.exports = Client

function Client(cfg) {
    var self = this
    self.cfg = handleCfg(cfg)
    self.labors = {}

    var browsers = cfg.browsrs
    browsers && browsers.forEach(function(browser) {
        self.labors[browser] = undefined
    })

    self.report = cfg.report || report

    if (cfg.clientRoot) {
        self.launchServer(function() {self.launchTest()})
    } else {
        self.launchTest()
    }
}

Client.prototype.launchServer = function(callback) {
    var self = this
    var cfg = self.cfg
    var clientRoot = cfg.clientRoot

    process.chdir(clientRoot)

    var app = express()
    app.use(express.static(clientRoot))
    app.listen(cfg.clientPort, cfg.clientHost, function() {
        logger.debug('start client server: ' + cfg.clientHost + ':' + cfg.clientPort)
        callback()
    }).on('error', function(e) {
        if (e.code === 'EADDRINUSE') {
            logger.warn('Port %d in use', cfg.clientPort);
            cfg.clientPort = randomPort();
            self.launchServer(callback)
        } else {
            throw e;
        }
    })
}

Client.prototype.launchTest = function() {
    var self = this
    var cfg = self.cfg
    var socket = self.socket = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/order')
    socket.on('connect', function () {
        var pkgFile = path.join(__dirname, '..', 'package.json')
        var version = JSON.parse(fs.readFileSync(pkgFile)).version

        if (!common.isUrl(cfg.runner)) {
            cfg.runner = dir2Url(cfg.runner, cfg)
        }

        if (cfg.adapter && !common.isUrl(cfg.adapter) && !common.isKeyword(cfg.adapter)) {
            cfg.adapter = dir2Url(cfg.adapter, cfg)
        }

        socket.emit('init', {
            runner: cfg.runner,
            adapter: cfg.adapter,
            charset: cfg.charset,
            browsers: cfg.browsers,
            version: version
        })

        self.timer = setTimeout(function() {
            if (self.isPrinting) {
                logger.debug('client timeout when printing results, let it go')
                clearTimeout(self.timer)
            } else {
                logger.debug('client timeout, will print results and then exit')
                self.report(self.labors)
                self.destroy()
            }
        }, cfg.timeout * 60 * 1000)
    })

    socket.on('report', function(reports) {
        var labors = self.labors

        reports.forEach(function(report) {
            var action = report.action
            var browser = report.browser
            if (browser) {
                var labor = labors[browser]
            }
            var info = report.info

            /* jshint -W004 */
            switch (action) {
                case 'log':
                    logger[info.type](info.message)
                    break
                case 'add':
                    var id = info.laborId
                    var ua = info.ua
                    labors[browser] = {
                        id: id,
                        ua: ua,
                        passes: [],
                        pending: [],
                        failures: [],
                        stats: undefined,
                        coverage: undefined
                    }
                    logger.debug('add labor: ' + id + ' [' + ua + ']')
                    break
                case 'remove':
                    labors[browser] = undefined
                    logger.debug('remove labor: ' + labor.id + ' [' + labor.ua + ']')
                    break
                case 'pass':
                    labor.passes.push(info)
                    print('.', 'green')
                    break
                case 'pending':
                    labor.pending.push(info)
                    print('.', 'cyan')
                    break
                case 'fail':
                    labor.failures.push(info)
                    print('×', 'red')
                    break
                case 'end':
                    labor.stats = info
                    break
                case 'endAll':
                    self.isPrinting = true
                    self.report(labors)
                    self.isPrinting = false
                    self.destroy()
                    break
                case 'browsers':
                    info.forEach(function(browser) {
                        labors[browser] = undefined
                    })
                    break
                default:
                    logger.warn('not realized report action: ' + action)
                    break
            }
        })
    })
    socket.on('error', function() {
        logger.error('server is not available, please check your config or try again later.')
    })
    socket.on('disconnect', function() {
        logger.error('server is interrupted, please try again later.')
    })
}

Client.prototype.destroy = function() {
    process.exit(0)
}


function print(str, c) {
    str = str || ''
    str = c ? colorful[c](str) : str
    process.stdout.write(str)
}

function dir2Url(p, cfg){
    return 'http://' + cfg.clientHost + ':' + cfg.clientPort +
            '/' + path.relative(cfg.clientRoot, p).replace(path.sep, '/')
}

function randomPort() {
    return Math.floor(Math.random() * 1000) + 7000
}
