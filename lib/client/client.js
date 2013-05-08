'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var io = require('socket.io-client')

var logger = require('../logger')
var utils = require('../utils')

var print = utils.print
var println = utils.println

module.exports = Client

function Client(cfg) {
    var self = this
    self.cfg = cfg
    self.labors = {/*
        browser: {
            id: laborId,
            ua: laborUa,
            reports: [],
            results: {}
        }
    */}
    cfg.browsers.forEach(function(browser) {
        self.labors[browser] = undefined
    })
    self.launchServer()
}

inherits(Client, EventEmitter)

Client.prototype.launchServer = function() {
    var self = this
    var cfg = self.cfg
    var root = cfg.clientRoot
    var runner = cfg.runner
    var runnerRelativePath = utils.normalizePath(path.relative(root, runner))
    var cwd = process.cwd()

    process.chdir(root)

    var app = self.app = express()
    app.get('/' + runnerRelativePath, function(req, res) {
        if (!self.cachedRunnerContent) {
            var adapt = require('./adapt')
            var content = fs.readFileSync(runner).toString()
            self.cachedRunnerContent = adapt(content, cfg.adapter)
        }
        res.send(self.cachedRunnerContent)
    })
    app.use(express.static(root))
    app.listen(cfg.clientPort, cfg.clientHost, function() {
        logger.debug('start client ' + cfg.clientHost + ':' + cfg.clientPort)

        self.launchTest()
    })
}

Client.prototype.launchTest = function() {
    var self = this
    var cfg = self.cfg
    var socket = self.socket = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/order')
    socket.on('connect', function () {

        socket.emit('init', {
            host: cfg.clientHost,
            port: cfg.clientPort,
            runner: path.relative(cfg.clientRoot, cfg.runner),
            browsers: cfg.browsers,
            timeout: cfg.timeout
        })

        self.timer = setTimeout(function() {
            if (self.isPrinting) {
                logger.debug('client timeout when printing results, let it go')
                clearTimeout(self.timer)
            } else {
                logger.debug('client timeout, will print results and then exit')
                self.printResults()
                self.destroy()
            }
        }, cfg.timeout * 60 * 1000)
    })

    socket.on('report', function(reports) {
        var labors = self.labors

        reports.forEach(function(report) {
            var action = report.action
            var browser = report.browser
            /* jshint -W004 */
            switch (action) {
                case 'addLabor':
                    var id = report.info.laborId
                    var ua = report.info.ua
                    labors[browser] = {
                        id: id,
                        ua: ua,
                        result: undefined,
                        reports: []
                    }
                    logger.debug('add labor: ' + id + ' [' + ua + ']')
                    break
                case 'removeLabor':
                    var id = labors[browser].id
                    var ua = labors[browser].ua
                    labors[browser] = undefined
                    logger.debug('remove labor: ' + id + ' [' + ua + ']')
                    break
                case 'pass':
                case 'pending':
                case 'fail':
                    var labor = labors[browser]
                    labor.reports.push(report)
                    print(
                        {pass: '.', 'pending': '.', fail: '×'}[action],
                        {pass: 'green', 'pending': 'cyan', fail: 'red'}[action]
                    )
                    break
                case 'end':
                    var labor = labors[browser]
                    labor.result = report
                    break
                case 'endAll':
                    self.printResults()
                    self.destroy()
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

Client.prototype.printResults = function() {
    var self = this
    var labors = self.labors
    self.isPrinting = true
    println()
    Object.keys(labors).forEach(function(browser) {
        println()
        var labor = labors[browser]
        if (labor) {
            var ua = labor.ua
            var reports =  labor.reports
            var result = labor.result
            var color = (!result || result.error || result.info.failures) ? 'red' : 'green'
            println(ua, color)
            // stats1: client timeout
            if (!result) {
                println('client timeout', color)
            // stats2: syntax error
            } else if (result.error) {
                var error = result.error
                var match = error.url.match(/runner\/.+?\/(.+)$/)
                /*
                 * NOTE
                 *
                 * in safari on Windows 7（may because it dose not enable debugging tool）
                 * sometimes window.onerror handler may receives incorrect args
                 */
                if (match) {
                    var p = match[1]
                    println('an error occurred at: ' + p + '(line ' + error.line + ')' , color)
                    println('    ' + error.message, color)
                } else {
                    println('an unknown error occurred')
                }
            // stats3: finished test, possibly pass or fail
            } else if (result.info) {
                var resultInfo = result.info
                println('passed ' + (resultInfo.tests-resultInfo.failures) +
                        ' of ' + resultInfo.tests +
                        ' tests in ' + resultInfo.duration+ 'ms', color)
                reports.forEach(function(report) {
                    var info = report.info
                    if (report.action === 'fail') {
                        println('    ' +
                            info.parent + ' > ' +
                            info.title + ' > ' +
                            info.message, 'red')
                    } else if (report.action === 'pass' && report.info.speed === 'slow') {
                        println('    ' +
                            info.parent + ' > ' +
                            info.title + ' > ' +
                            info.speed +
                            ' [' + info.duration + 'ms]', 'yellow')
                    }
                })
            }
        // stats4: not found matched browser
        } else {
            println(browser, 'red')
            println('not found matched browser', 'red')
        }
    })
    self.isPrinting = false
}

Client.prototype.destroy = function() {
    process.exit(0)
}



