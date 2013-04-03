'use strict';

var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./../utils')
var Labor = require('./labor')

module.exports = Contractor

function Contractor(cfg) {
    var self = this
    if (!( self instanceof Contractor)) {
        return new Contractor(cfg)
    }
    cfg = utils.mix(cfg, require('./config').contractor)
    self.cfg = cfg
    self.candidates = {}
    self.labors = {}
    self.launchServer()
}


Contractor.prototype.launchServer = function(){
    var self = this
    var cfg = self.cfg
    var app  = express()
    var server = require('http').createServer(app)
    var io = require('socket.io').listen(server, {
        log : false
    })
    
    var staticPath = path.join(__dirname, '..', '..', 'static')
    app.get('/', function(req, res) {
        res.send(fs.readFileSync(path.join(staticPath, 'contractor.html')).toString())
    })
    app.use(express.static(staticPath))
    
    server.listen(cfg.serverPort, cfg.serverHost, function() {
        logger.debug('start server "' + cfg.serverHost + ':' + cfg.serverPort + '"')
    })

    io.of('/labor').on('connection', function(socket) {
        self.addLabor(socket)
    })
    io.of('/order').on('connection', function(socket){
    })
}

Contractor.prototype.addLabor = function(socket){
    var self = this
    var labor = new Labor(socket)
    var id = socket.id
    self.candidates[id] = labor
    labor.on('ready', function(){
        self.labors[id] = labor
        delete self.candidates[id]
    })
    labor.on('resign', function(){
        delete self.labors[id]
        delete self.candidates[id]
    })
}

Contractor()