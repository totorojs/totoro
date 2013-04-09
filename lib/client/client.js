'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var net = require('net')

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
    serverTcpPort: '8999'
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
    self.results = []
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
    
    var socket = self.socket = net.connect({
        port: cfg.serverTcpPort,
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
                case 'pass':
                    process.stdout.write('.')
                    break
                case 'pending':
                    process.stdout.write('.')
                    break
                case 'fail':
                    process.stdout.write('-')
                    break
                case 'end':
                    self.results.push(item)
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
}

Client.prototype.printResults = function(){
    var self = this
    var results = self.results
    _.each(results, function(result, idx, results){
        process.stdout.write('\n')
        process.stdout.write(result.platform)
        process.stdout.write('\n')
        process.stdout.write('    ')
        process.stdout.write('passed ' 
            + (result.info.passes + result.info.pending) 
            + ' of ' 
            + result.info.tests
            + ' tests, duration is ' 
            + result.info.duration
            + 'ms.' )
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

