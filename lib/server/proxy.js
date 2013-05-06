'use strict';

var http = require('http')
var when = require('when')

var logger = require('../logger')

exports.getContent = function(server, req, callback) {

    var match = req.path.match(/runner\/([^/]+)\/(.*)/)
    var id = match[1]
    var p = match[2]

    var all = Cache.all
    var order = server.orderManager.get(id)
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
        headers: req.headers
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

Cache.all = {}

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
    var path
    for (var i in this.caches) {
        if (i === p){
            path = i
            break
        }
    }
    return path && this.caches[path].promise
}
