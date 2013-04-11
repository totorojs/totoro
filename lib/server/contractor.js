'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var http = require('http')

var logger = require('./logger')
var utils = require('./../utils')
var Labor = require('./labor')
var Order = require('./order')
var utils = require('./../utils')

var ip = utils.getExternalIpAddress()
var defaultCfg = {
    host : ip,
    port : '9999'
}

module.exports = Contractor

function Contractor(cfg) {
    var self = this
    if (!( self instanceof Contractor)) {
        return new Contractor(cfg)
    }
    cfg = utils.mix(cfg, defaultCfg)
    self.cfg = cfg
    self.labors = {}
    self.orders = {}
    self.cache = {}
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
    var contentTypes = {
        'js': 'application/x-javascript',
        'css': 'text/css',
        'jpg': 'application/x-jpg',
        'gif': 'image/gif',
        'png': 'application/x-png',
        'swf': 'application/x-shockwave-flash'
    }
    app.get('/runner/*', function(req, res) {
        var cache = self.cache
        var match = req.path.match(/runner\/([^/]+)\/(.*)/)
        var id = match[1]
        var p = match[2]
        var suffix = p.match(/.([^.]+)$/)[1]
        if (cache[id] && cache[id][p]) {
            logger.debug('contractor proxy cached: ' + id + '/' + p)
            if(suffix in contentTypes){
                res.set('Content-Type', contentTypes[suffix])
            }
            res.send(cache[id][p])
        } else {
            logger.debug('contractor proxy not cached: ' + id + '/' + p)
            cache[id] = cache[id] || {}
            var order = self.orders[id]
            var request = http.get('http://' + order.host + ':' + order.port + '/' + p, function(response) {
                var content = ''
                response.on('data', function (chunk) {
                    content += chunk
                })
                response.on('end', function(chunk){
                    if(suffix in contentTypes){
                        res.set('Content-Type', contentTypes[suffix])
                    }
                    res.send(content)
                    cache[id][p] = content
                })
            }).on('error', function(e) {
                order.destory()
            })
        }
    })
    app.use(express.static(staticPath))

    server.listen(cfg.port, cfg.host, function(socket) {
        logger.debug('start server "' + cfg.host + ':' + cfg.port + '"')
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
    var self = this
    var platforms = order.platforms
    // TODO filter labors according to platforms
    var labors = self.labors
    _.each(labors, function(labor) {
        order.addLabor(labor)
        labor.addOrder(order)
    })
}
Contractor()