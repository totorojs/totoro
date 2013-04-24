'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var express = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var http = require('http')
var when = require('when')

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
        var all = Cache.all
        var match = req.path.match(/runner\/([^/]+)\/(.*)/)
        var id = match[1]
        var p = match[2]

        getProxyContent(id, req.headers, p, function(cache) {
            res.writeHead(cache.statusCode, cache.headers)
            res.write(cache.data)
            res.end()
        })
    })

    function getProxyContent(id, headers, p, callback) {
        var all = Cache.all
        var order = self.orderManager.getOrder(id)
        var cache = all[id] || (all[id] = new Cache(order))

        var pathCache = cache.find(p)

        if (pathCache) {
            pathCache.then(callback)
            return
        }

        pathCache = cache.addDefer(p);
        pathCache.then(callback)

        var options = {
            hostname: order.host,
            port: order.port,
            path: '/' + p,
            headers: headers
        }

        var request = http.request(options, function(res) {
            var buffer = new Buffer(parseInt(res.headers['content-length'], 10))
            var offset = 0

            res.on('data', function(data) {
                data.copy(buffer, offset)
                offset += data.length
            })

            res.on('end', function() {
                cache.add(p, res.statusCode, res.headers, buffer)
                //callback(null, _cache)
            })
        }).on('error', function(e) {
            logger.warn('cache resource error: ' + e)
            callback({
                statusCode: 500,
                data: e
            })
        })
        request.end()
    }

    app.get('/list', function(req, res) {
        res.send(self.laborManager.viewLabors())
    })

    app.use(express.static(staticPath))

    server.listen(cfg.serverPort, cfg.serverHost, function(socket) {
        logger.debug('start server ' + cfg.serverHost + ':' + cfg.serverPort)
    })

    // labor socket
    io.of('/labor').on('connection', function(socket) {
        self.newLabor(socket)
    })

    // client socket
    io.of('/client').on('connection', function(socket) {
        self.newOrder(socket)
    })

    // browsers socket
    io.of('/notice').on('connection', function(socket) {
        socket.emit('launchServer', {capture: 'http://' + cfg.serverHost + ':' + cfg.serverPort})

        self.laborManager.on('addLabor', function(labor){
            socket.emit('addLabor', {id: labor.id})
        })

        self.laborManager.on('removeLabor', function(laborId){
            socket.emit('removeLabor', {id: laborId})
        })
    })
}

Server.prototype.newLabor = function(socket) {
    var self = this
    var laborManager = self.laborManager
    socket.on('init', function(data) {
        var id = socket.id
        if(data.id && !laborManager.labors[data.id] && !laborManager.busyLabors[data.id]) {
            id = data.id
        }else{
            logger.warn('labor id: ' + data.id +
                    ' specified by query string is repeated,' +
                    ' will use socket id: ' + socket.id)
        }
        var labor = new Labor(id, socket, data)
        self.laborManager.addLabor(labor)
    })
}

Server.prototype.newOrder = function(socket) {
    var self = this
    socket.on('init', function(data) {
        var order = new Order(socket.id, socket, data)
        self.orderManager.addOrder(order)
        self.laborManager.addOrder(order)
    })
}

function Cache(order) {
    this.caches = {}
    order.on('destroy', function() {
        /**
        var caches = Cache.all[order.id].caches
        _.keys(caches).forEach(function(c) {
            delete caches[c].data
        })
        **/

        delete Cache.all[order.id]
    })
}

Cache.prototype.add = function(p, statusCode, headers, data) {
    var info = {
        path: p,
        statusCode: statusCode,
        headers: headers,
        data: data
    }
    this.caches[p].resolve(info)
    this.caches[p]._cache = info
}

Cache.prototype.addDefer = function(p) {
    return (this.caches[p] = when.defer()).promise
}

Cache.prototype.find = function(p) {
    var path = _.find(_.keys(this.caches), function(path) {
        return path === p
    })

    return path && this.caches[path].promise
}

Cache.all = {}

