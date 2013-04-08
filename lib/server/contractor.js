'use strict';

var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var net = require('net')

var logger = require('./logger')
var utils = require('./../utils')
var Labor = require('./labor')
var utils = require('./../utils')

var ip = utils.getExternalIpAddress()
var defaultCfg = {
    host : ip,
    httpPort : '9000',
    tcpPort : '8999'
}

module.exports = Contractor

function Contractor(cfg) {
    var self = this
    if (!( self instanceof Contractor)) {
        return new Contractor(cfg)
    }
    cfg = utils.mix(cfg, defaultCfg)
    self.cfg = cfg
    self.candidates = {}
    self.labors = {}
    self.launchServer()
}

Contractor.prototype.launchServer = function() {
    var self = this
    var cfg = self.cfg
    var app = self.app = express()
    var server = require('http').createServer(app)
    var io = self.io = require('socket.io').listen(server, {
        log : false
    })

    var staticPath = path.join(__dirname, '..', '..', 'static')
    app.get('/', function(req, res) {
        res.send(fs.readFileSync(path.join(staticPath, 'contractor.html')).toString())
    })
    app.use(express.static(staticPath))

    // http server
    server.listen(cfg.httpPort, cfg.host, function(socket) {
        logger.debug('start http server "' + cfg.host + ':' + cfg.httpPort + '"')
    })
    // socket for labor
    io.of('/labor').on('connection', function(socket) {
        self.addLabor(socket)
    })
    io.sockets.on('connection', function(socket) {
        self.addLabor(socket)
    });

    // socket for order
    var tcpServer = self.tcpServer = net.createServer(function(socket) {
        socket.on('data', function(data) {
            logger.debug(data)
        })
    })
    tcpServer.listen(cfg.tcpPort, cfg.host, function() {
        logger.debug('start tcp server "' + cfg.host + ':' + cfg.tcpPort + '"')
    })
}

Contractor.prototype.addLabor = function(socket) {
    var self = this
    var labor = new Labor(socket)
    var id = socket.id
    self.candidates[id] = labor
    labor.on('ready', function() {
        self.labors[id] = labor
        delete self.candidates[id]
        //logger.debug('labors: ' + _.keys(self.labors))
    })
    labor.on('resign', function() {
        delete self.labors[id]
        delete self.candidates[id]
        //logger.debug('labors: ' + _.keys(self.labors))
    })
}

Contractor.prototype.addOrder = function(socket) {
    var self = this
    var order = new Order(socket)
    var id = socket.id
    self.orders[id] = order
}
Contractor()