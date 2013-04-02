'use strict';

var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./../utils')
var handleRunner = require('./handle-runner')

module.exports = Task

function Task(cfg) {
    var self = this
    if (!( self instanceof Task)) {
        return new Task(cfg)
    }
    cfg = utils.mix(cfg, require('./config').task)
    cfg = handleRunner(cfg)
    if (!cfg.clientRoot) {
        cfg.clientRoot = guessRoot(cfg.testsDir)
    }
    self.cfg = cfg
    self.launchServer()
}

Task.prototype.launchServer = function() {
    var self = this
    var cfg = self.cfg
    var runner = cfg.runner
    var root = cfg.clientRoot
    var cwd = process.cwd()

    process.chdir(root)
    
    var app = cfg.app = express()
    var server = require('http').createServer(app)
    var io = cfg.io = require('socket.io').listen(server, { log: false })
    server.listen(cfg.clientPort, cfg.clientHost, function() {
        logger.debug('start local server "' + cfg.clientHost + ':' + cfg.clientPort + '"')
    })

    app.get('/' + path.relative(root, runner), function(req, res) {
        if(!self.runnerCache){
            var adapt = require('./adapt')
            var content = fs.readFileSync(runner).toString()
            self.runnerCache = adapt(content, cfg.adapter)
        }
        res.send(self.runnerCache)
    })
    app.use(express.static(root))

    io.sockets.on('connection', function(socket) {
        socket.on('start', function (data) {
            console.log('start')
        })
        socket.on('end', function(data){
            console.log('end')
            //self.end()
        })
    })
    
}

Task.prototype.start = function() {

}

Task.prototype.end = function() {
    process.exit(0)
}

Task.prototype.getAvilableBrowsers = function() {

}

function guessRoot(testsDir) {
    // TODO
    var root = path.join(testsDir, '../')
    logger.debug('guess root is "' + root + '"')
    return root
}

Task({
    //runner:'tests/arunner.html',
    //tests:['tests/example-spec.js', 'tests/haha.js'],
    overwrite : true
})

