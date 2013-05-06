'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')


var logger = require('../logger')
var proxy = require('./proxy')
var LaborManager = require('./labor-manager')
var OrderManager = require('./order-manager')
var Labor = require('./labor')
var Order = require('./order')

module.exports = Server

function Server(cfg) {
    var self = this
    self.cfg = cfg
    self.laborManager = new LaborManager()
    self.orderManager = new OrderManager()
    self.launchServer()
}

inherits(Server, EventEmitter)

Server.prototype.launchServer = function() {
    var self = this
    var cfg = self.cfg
    var app = self.app = express()
    var server = require('http').createServer(app)
    var io = self.io = require('socket.io').listen(server, {
        log : false
    })

    io.set('transports', [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ])

    // labor register
    var staticPath = path.join(__dirname, '..', '..', 'static')
    app.get('/', function(req, res) {
        res.send(fs.readFileSync(path.join(staticPath, 'labor.html')).toString())
    })

    // runner proxy
    app.get('/runner/*', function(req, res) {
        proxy.getContent(self, req, function(content) {
            res.writeHead(content.statusCode, content.headers)
            res.write(content.data)
            res.end()
        })
    })

    app.get('/list', function(req, res) {
        res.send(self.laborManager.list())
    })

    app.use(express.static(staticPath))

    server.listen(cfg.serverPort, cfg.serverHost, function(socket) {
        logger.debug('start server ' + cfg.serverHost + ':' + cfg.serverPort)
    })

    // labor socket
    io.of('/labor').on('connection', function(socket) {
        socket.on('init', function(data) {
            var labor = new Labor(socket.id, socket, data)
            self.laborManager.addLabor(labor)
        })
    })

    // client socket
    io.of('/order').on('connection', function(socket) {
        socket.on('init', function(data) {
            var order = new Order(socket.id, socket, data)
            self.orderManager.addOrder(order)
            self.laborManager.addOrder(order)
        })
    })
}
