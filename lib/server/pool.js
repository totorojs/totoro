'use strict';

var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./../utils')
var labor = require('./labor')

module.exports = Pool

function Pool(cfg) {
    var self = this
    if (!( self instanceof Pool)) {
        return new Pool(cfg)
    }
    cfg = utils.mix(cfg, require('./config').pool)
    self.cfg = cfg
    self.launchServer()
}


Pool.prototype.launchServer = function(){
    var self = this
    var cfg = self.cfg
    var app  = express()
    var server = require('http').createServer(app)
    var io = require('socket.io').listen(server, {
        log : false
    })
    
    var staticPath = path.join(__dirname, '..', '..', 'static')
    app.get('/', function(req, res) {
        res.send(fs.readFileSync(path.join(staticPath, 'pool.html')).toString())
    })
    app.use(express.static(staticPath))
    
    server.listen(cfg.serverPort, cfg.serverHost, function() {
        logger.debug('start server "' + cfg.serverHost + ':' + cfg.serverPort + '"')
    })

    io.of('/labor').on('connection', function(socket) {
        self.addLabor(socket)
    })
}

Pool.prototype.addLabor = function(socket){
    var self = this
    var id = socket.id
    self.labors[id] = labor(socket)
    labor.on('die', function(){
        self.labors[id] = undefined
    })
}

Pool()