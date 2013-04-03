'use strict';

var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var net = require('net')

var logger = require('./logger')
var utils = require('./../utils')
var handleRunner = require('./handle-runner')

module.exports = Client

function Client(cfg) {
    var self = this
    if (!( self instanceof Client)) {
        return new Client(cfg)
    }
    cfg = utils.mix(cfg, require('./config').client)
    cfg = handleRunner(cfg)
    if (!cfg.clientRoot) {
        cfg.clientRoot = guessRoot(cfg.testsDir)
    }
    self.cfg = cfg
    self.launchServer()
}

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
    }, function(){
        socket.write(JSON.stringify({
            host: cfg.clientHost,
            port: cfg.clientPort,
            runner: path.relative(cfg.clientRoot, cfg.runner)
        }), function(){
            logger.info('test started !')
        })
        socket.on('data', function(data){
            
        })
        socket.on('end', function(data){
        
        })
    })
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

