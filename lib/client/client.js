'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var net = require('net')
var io = require('socket.io-client')

var logger = require('./logger')
var utils = require('./../utils')
var handleRunner = require('./handle-runner')

var ip = utils.getExternalIpAddress()
var defaultCfg = {
    //tests: undefined,
    //runner: undefined,
    //adapter:undefined,
    //override: false,
    //reporter: undefined,
    //platforms: undefined,
    //runInIframe: false,
    //clientRoot: undefined,
    clientHost: ip,
    clientPort: '8888',
    serverHost: ip,
    serverPort: '9000'
}

module.exports = Client

function Client(cfg) {
    var self = this
    if (!( self instanceof Client)) {
        return new Client(cfg)
    }
    cfg = utils.mix(cfg, defaultCfg)
    cfg = handleRunner(cfg)
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
        var adapt = require('./adapt')
        var content = fs.readFileSync(runner).toString()
            content = adapt(content, cfg.adapter)
        res.send(content)
    })
    app.use(express.static(root))
    app.listen(cfg.clientPort, cfg.clientHost, function() {
        logger.debug('start client server "' + cfg.clientHost + ':' + cfg.clientPort + '"')
        self.order()
    })
}

Client.prototype.order = function() {
    var self = this
    var cfg = self.cfg
    var socket = self.socket = io.connect('http://' + cfg.serverHost + ':' + cfg.serverPort + '/client')
    socket.on('connect', function () {
        socket.emit('order', {
            host: cfg.clientHost,
            port: cfg.clientPort,
            runner: path.relative(cfg.clientRoot, cfg.runner)
        })
    })
    socket.on('report', function(data){
        console.log(data)
        if(data.action === 'endAll'){
            self.destroy()
        }
    })
    socket.on('error', function(){
        logger.error('server is not avilable, please try again later.')
    })
    socket.on('disconnect', function(){
        logger.error('server is interrupted, please try again later.')
    })
    
    /*
    var socket = self.socket = net.connect({
        port: cfg.serverPort,
        host: cfg.serverHost
    })
    
    socket.on('error', function(){
        logger.error('server is not avilable, please try again later.')
    })
    socket.on('connect', function(){
        socket.write(JSON.stringify({
            action: 'order',
            info: {
                host: cfg.clientHost,
                port: cfg.clientPort,
                runner: path.relative(cfg.clientRoot, cfg.runner)
            }
        }), function(){
            console.log('test started !')
        })
    })
    socket.on('data', function(data){
        data = JSON.parse(data)
        _.each(data, function(item){
            switch(item.action){
                case 'addLabor':
                    item.reports = []
                    self.labors[item.laborId] = item
                    break
                case 'pass':
                    self.labors[item.laborId].reports.push(item)
                    process.stdout.write('.')
                    break
                case 'pending':
                    self.labors[item.laborId].reports.push(item)
                    process.stdout.write('>')
                    break
                case 'fail':
                    self.labors[item.laborId].reports.push(item)
                    process.stdout.write('-')
                    break
                case 'end':
                    self.labors[item.laborId].result = item
                    break
                case 'endAll':
                    self.printResults()
                    self.destroy()
                    break
                default:
                    break
            }
        })
        
    })
    socket.on('end', function(){
        console.log('disconnected')
    })
    */
}

Client.prototype.printResults = function(){
    var self = this
    var labors = self.labors
    _.each(labors, function(labor, key, labors){
        process.stdout.write('\n')
        process.stdout.write('passed ' 
            + (labor.result.info.passes + labor.result.info.pending) 
            + ' of ' 
            + labor.result.info.tests
            + ' tests, duration is ' 
            + labor.result.info.duration
            + 'ms. ['
            + labor.platform
            + ']' )
       var reports = labor.reports
        _.each(reports, function(report, idx, reports){
            if(report.action === 'fail'){
                var info = report.info
                process.stdout.write('\n')
                process.stdout.write('    ' + info.parent + ': ' + info.title + '  ' + info.message)
            }
        })
    })
    process.stdout.write('\n')
}

Client.prototype.destroy = function(){
    var self = this
    process.exit(0)
    logger.debug('destroy client.')
}

function guessRoot(testsDir) {
    // TODO
    var root = path.join(testsDir, '../')
    logger.debug('guess root is "' + root + '"')
    return root
}

Client({
    //runner:'tests/arunner.html',
    //tests:['tests/example-spec.js', 'tests/haha.js'],
    overwrite : true
})

