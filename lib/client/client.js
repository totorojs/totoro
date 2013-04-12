'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var io = require('socket.io-client')
var colorful = require('colorful')

var logger = require('../logger')

var colorMap = {
    pass: 'green',
    pending: 'blue',
    fail: 'red'
}

module.exports = Client

function Client(cfg) {
    var self = this
    if (!( self instanceof Client)) {
        return new Client(cfg)
    }

    if (!cfg.clientRoot) {
        cfg.clientRoot = guessRoot(cfg.testsDir)
    }
    self.cfg = cfg
    self.labors = {}

    self.launchServer()
}

inherits(Client, EventEmitter)

Client.prototype.launchServer = function() {
    var self = this
    var cfg = self.cfg
    var runner = cfg.runner
    var root = cfg.clientRoot
    var cwd = process.cwd()
    var runnerRelativePath = path.relative(root, runner)

    process.chdir(root)

    var app = self.app = express()
    app.get('/' + runnerRelativePath, function(req, res) {
        if(!self.cachedRunnerContent){
            var adapt = require('./adapt')
            var content = fs.readFileSync(runner).toString()
            self.cachedRunnerContent = adapt(content, cfg.adapter)
        }
        res.send(self.cachedRunnerContent)
    })
    app.use(express.static(root))
    app.listen(cfg.clientPort, cfg.clientHost, function() {
        logger.debug('start client "' + cfg.clientHost + ':' + cfg.clientPort + '"')
        self.order()
    })
}

Client.prototype.order = function() {
    var self = this
    var cfg = self.cfg
    var socket = self.socket = io.connect('http://' + cfg.serverHost + ':' + cfg.serverPort + '/client')
    socket.on('connect', function () {
        println('test started !')
        println()
        socket.emit('order', {
            host: cfg.clientHost,
            port: cfg.clientPort,
            runner: path.relative(cfg.clientRoot, cfg.runner)
        })
    })
    socket.on('report', function(data){
        var labors = self.labors
        _.each(data, function(item, idx, data){
            var laborId = item.laborId
            var action = item.action
            if(action === 'addLabor'){
                labors[laborId] = {
                    platform: item.info.platform,
                    result: undefined,
                    reports: []
                }
                logger.debug('add labor "' + laborId + ' [' + item.info.platform + ']"')
            }else if(action === 'removeLabor'){
                delete labors[laborId]
                logger.debug('remove labor "' + laborId + '"')
            }else if(_.indexOf(['pass', 'pending', 'fail'], action) > -1){
                var labor = labors[laborId]
                labor.reports.push(item)
                print('.', colorMap[action])
            }else if(action === 'end'){
                labor = labors[laborId]
                labor.result = item
            }else if(action === 'endAll'){
                self.printResults()
                self.destroy()
            }
        })
    })
    socket.on('error', function(){
        logger.error('server is not avilable, please check your config or try again later.')
    })
    socket.on('disconnect', function(){
        logger.error('server is interrupted, please try again later.')
    })
}

Client.prototype.printResults = function(){
    var self = this
    var labors = self.labors
    println()
    _.each(labors, function(labor, key, labors){
        println()
        var platform = labor.platform
        var result = labor.result
        var reports =  labor.reports
        var color = (result.error || result.info.failures) ? 'red' : 'green'
        println(platform, color)
        if(result.error){
            var err = result.error
            var p = err.url.match(/runner\/.+?\/(.+)$/)[1]
            println('an error occued at: ' + p + '(line ' + err.line + ')' , color)
            println('    ' + err.message, color)
        }else if(result.info){
            var resultInfo = result.info
            println('passed ' + (resultInfo.tests-resultInfo.failures) +
                    ' of ' + resultInfo.tests +
                    ' tests in ' + resultInfo.duration+ 'ms', color)
            _.each(reports, function(report, idx, reports){
                var info = report.info
                if(report.action === 'fail'){
                    println('    ' +
                        info.parent + ' - ' +
                        info.title + ' - ' +
                        info.message, 'red')
                }else if(report.action === 'pass' && report.info.speed !== 'fast'){
                    println('    ' +
                        info.parent + ' - ' +
                        info.title + ' - ' +
                        info.speed +
                        '[' + info.duration + 'ms]', 'yellow')
                }
            })
        }
    })
}

Client.prototype.destroy = function(){
    println()
    println('test finished !')
    process.exit(0)
}

function guessRoot(testsDir) {
    // TODO
    var root = path.join(testsDir, '../')
    logger.debug('guess root is "' + root + '"')
    return root
}

function print(str, color){
    str = str || ''
    str = color ? colorful[color](str) : str
    process.stdout.write(str)
}

function println(str, color){
    print(str, color)
    process.stdout.write('\n')
}
