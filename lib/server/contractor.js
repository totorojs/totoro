'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var http = require('http')

var logger = require('../logger')
var Labor = require('./labor')
var Order = require('./order')

module.exports = Contractor

function Contractor(cfg) {
    var self = this
    if (!( self instanceof Contractor)) {
        return new Contractor(cfg)
    }

    self.cfg = cfg
    self.labors = {}
    self.orders = {}
    self.launchServer()
}

inherits(Contractor, EventEmitter)

Contractor.prototype.launchServer = function() {
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
        res.send(fs.readFileSync(path.join(staticPath, 'contractor.html')).toString())
    })

    // runner proxy
    app.get('/runner/*', function(req, res) {
        var cache = self.cache
        var match = req.path.match(/runner\/([^/]+)\/(.*)/)
        var id = match[1]
        var p = match[2]
        var suffix = p.match(/.([^.]+)$/)[1]
        //logger.debug('contractor proxy: ' + id + '/' + p)
        var order = self.orders[id]
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
        var labors = self.getLabors()
        labors = Object.keys(labors).map(function(id) {
            return labors[id].ua.source
        })

        res.send(labors)
    })

    app.use(express.static(staticPath))

    server.listen(cfg.serverPort, cfg.serverHost, function(socket) {
        logger.debug('start server "' + cfg.serverHost + ':' + cfg.serverPort + '"')
    })

    // labor socket
    io.of('/labor').on('connection', function(socket){
        self.newLabor(socket)
    })

    // client socket
    io.of('/client').on('connection', function(socket){
        self.newOrder(socket)
    })
}

Contractor.prototype.newLabor = function(socket) {
    var self = this
    var id = socket.id
    var labor = new Labor(id, socket)
    labor.on('init', function() {
        self.labors[id] = labor
        //logger.debug('labors: ' + _.keys(self.labors))
    })
    labor.on('destroy', function() {
        delete self.labors[id]
        //logger.debug('labors: ' + _.keys(self.labors))
    })
}

Contractor.prototype.newOrder = function(socket) {
    var self = this
    var id = socket.id
    var order = new Order(id, socket)
    self.orders[id] = order
    order.on('init', function() {
        self.distribute(order)
    })
    order.on('destroy', function() {
        delete self.orders[id]
    })
}

Contractor.prototype.distribute = function(order) {
    var platforms = order.platforms
    // TODO filter labors according to platforms
    var labors = this.getLabors()
    _.each(labors, function(labor) {
        order.addLabor(labor)
        labor.addOrder(order)
    })
}


Contractor.prototype.getLabors = function() {
    var labors = this.labors;
    var uas = []
    var ids = []
    var new_labors = {}
    Object.keys(labors).forEach(function(id) {
        var ua = labors[id].ua.source
        if (uas.indexOf(ua) < 0) {
            uas.push(ua)
            new_labors[id] = labors[id]
        }
    })

    return new_labors
}
