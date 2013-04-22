'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var http = require('http')

var logger = require('../logger')
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
        var cache = self.cache
        var match = req.path.match(/runner\/([^/]+)\/(.*)/)
        var id = match[1]
        var p = match[2]
        var suffix = p.match(/.([^.]+)$/)[1]
        var order = self.orderManager.getOrder(id)
        var options = {
            hostname: order.host,
            port: order.port,
            path: '/' + p,
            headers: req.headers
        }
        var request = http.request(options, function(response){
            res.writeHead(response.statusCode, response.headers)
            response.on('data', function(data){
                res.write(data)
            })
            response.on('end', function(){
                res.end()
            })
        }).on('error', function(e) {
            order.destroy()
        })
        request.end()
    })

    app.get('/list', function(req, res) {
        res.send(self.laborManager.viewLabors())
    })

    app.use(express.static(staticPath))

    server.listen(cfg.serverPort, cfg.serverHost, function(socket) {
        logger.debug('start server ' + cfg.serverHost + ':' + cfg.serverPort)
    })

    // labor socket
    io.of('/labor').on('connection', function(socket){
        self.newLabor(socket)
    })

    // client socket
    io.of('/client').on('connection', function(socket){
        self.newOrder(socket)
    })

    // browsers socket
    io.of('/browsers').on('connection', function(socket) {
        socket.emit('action', 'start', '*', 'http://' + cfg.serverHost + ':' + cfg.serverPort)
    })
}

Server.prototype.newLabor = function(socket) {
    var self = this
    socket.on('init', function(data){
        var labor = new Labor(socket, data)
        self.laborManager.addLabor(labor)
    })
}

Server.prototype.newOrder = function(socket) {
    var self = this
    socket.on('init', function(data){
        var order = new Order(socket, data)
        self.orderManager.addOrder(order)
        self.laborManager.take(order)
    })
}