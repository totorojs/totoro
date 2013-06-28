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

module.exports = Client

function Client(cfg) {
    var self = this
    self.cfg = handleCfg(cfg)

    if (cfg.list) {
        list(cfg)
        return
    }

    self.labors = {/*
        browser: {
            id: laborId,
            ua: laborUa,
            reports: [],
            result: {}
        }
    */}
    var browsers = cfg.browsrs
    browsers && browsers.forEach(function(browser) {
        self.labors[browser] = undefined
    })

    self.report = cfg.report || printResult


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
            /* jshint -W004 */
            switch (action) {
                case 'log':
                    logger[report.info.type](report.info.message)
                    break
                case 'add':
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
                case 'remove':
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
                    self.isPrinting = true
                    self.report(labors)
                    self.isPrinting = false
                    self.destroy()
                    break
                case 'browsers':
                    var browsers = report.info
                    browsers.forEach(function(browser) {
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


// list all available browsers
function list(cfg) {
    var listUrl = 'http://' + cfg.serverHost + ':' + cfg.serverPort + '/list'

    http.get(listUrl, function(res) {
        var data = ''

        res.on('data', function(chunk) {
            data += chunk
        })

        res.on('end', function() {
            var labors = JSON.parse(data)
            if(Object.keys(labors).length) {
                console.info()
                console.info(colorful.cyan('  active browsers:'))
                Object.keys(labors).sort().forEach(function(item, index, list) {
                    console.info('    ' + item + colorful.gray(' [' + labors[item] + ']'))
                })
                console.info()
            } else {
                console.info(colorful.red('  no active browser'))
            }
        })
    }).on('error', function(e) {
        logger.error('server is not available, please check your config or try again later.')
    })
}


// default reporter
function printResult(labors) {
    // pull all failed labors to tail of rankedLabors
    // to make sure that user can see all failures by minimal scrolling
    var rankedLabors = []
    var failedLaborsAmount = 0
    Object.keys(labors).forEach(function(browser) {
        var labor = labors[browser]
        if (!labor || !labor.result || labor.result.error || labor.result.info.failures) {
            rankedLabors.push([browser, labor, 'red'])
            failedLaborsAmount ++
        } else {
            rankedLabors.unshift([browser, labor, 'green'])
        }
    })
    var laborsAmount = rankedLabors.length

    println()
    rankedLabors.forEach(function(item) {
        println()
        var browser = item[0]
        var labor = item[1]
        var color = item[2]

        if (labor) {
            var ua = labor.ua
            var reports =  labor.reports
            var result = labor.result

            println('  ' + ua, color)

            // stats1: client timeout
            if (!result) {
                println('  Client timeout', color)
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
                    println('  An error occurred at: ' + p + '(line ' + error.line + ')' , color)
                    println('    ' + error.message, color)
                } else {
                    println('  An unknown error occurred', color)
                }
            // stats3: finished test, possibly pass or fail
            } else if (result.info) {
                var resultInfo = result.info

                if (resultInfo.failures) {
                    println('  Failed ' + resultInfo.failures +
                        ' of ' + resultInfo.tests +
                        ' tests in ' + resultInfo.duration+ 'ms', color)
                } else {
                    println('  Passed all of ' + resultInfo.tests +
                        ' tests in ' + resultInfo.duration+ 'ms', color)
                }

                reports.forEach(function(report) {
                    var info = report.info
                    if (report.action === 'fail') {
                        println('    ' +
                            info.parent + ' > ' +
                            info.title + ' > ' +
                            info.message, color)
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
            println('  ' + browser, color)
            println('  Not found matched browser', color)
        }
    })
    println()

    var color
    var summary
    if (failedLaborsAmount) {
        color = 'red'
        summary = 'Failed on ' + failedLaborsAmount + ' of ' + laborsAmount + ' browsers'
    } else {
        color = 'green'
        summary = 'Passed on all of ' + laborsAmount + ' browsers'
    }
    var sliptLine = generateSplitLine(summary.length)
    println(sliptLine, color)
    println('  ' + summary, color)
    println(sliptLine, color)
    println()
}

function generateSplitLine(len) {
    var rt = ''
    for(var i = 0; i < len + 4; i ++) {
        rt += '='
    }
    return rt
}


function print(str, c) {
    str = str || ''
    str = c ? colorful[c](str) : str
    process.stdout.write(str)
}

function println(str, c) {
    print(str, c)
    process.stdout.write('\n')
}


function dir2Url(p, cfg){
    return 'http://' + cfg.clientHost + ':' + cfg.clientPort +
            '/' + path.relative(cfg.clientRoot, p).replace(path.sep, '/')
}

function randomPort() {
    return Math.floor(Math.random() * 1000) + 7000
}