'use strict';

var express = require('express')
var path = require('path')
var http = require('http')
var common = require('totoro-common')
var io = require('socket.io-client')
var jsonOverTCP = require('json-over-tcp')


process.chdir(process.cwd())

var app = express()
var cfg = {
    clientHost: common.getExternalIpAddress(),
    clientPort: 9998,
    serverHost: common.getExternalIpAddress(),
    serverPort: 9996
}

app.use(express.static(process.cwd()))
app.listen(cfg.clientPort, cfg.clientHost, function() {
    console.info('start client server: ' + cfg.clientHost + ':' + cfg.clientPort)
    var socket = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/proxy')

    socket.on('getInfo', function (info) {
        getInfo(cfg, info, function(info) {
            socket.emit('proxyData', info)
        })
    })

    var socket2 = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/http')

    socket2.on('begin', function() {
        socket2.emit('begin', {
            hostname: cfg.clientHost,
            port: cfg.clientPort
        })
    })

    var socket3 = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/tcp')

    socket3.on('begin', function() {
        socket3.emit('begin', {
            hostname: cfg.clientHost,
            port: 9997
        })
    })

    var server = jsonOverTCP.createServer({
        port: 9997,
        host: cfg.clientHost
    });
    server.listen(9997);

    server.on('connection', function(socket) {
        socket.on('data', function(data) {

            getInfo(cfg, data.path, function(info) {
                socket.write(info)
            })
        })
    })
})

function getInfo(cfg, p, cb) {
    var opts = {
        hostname: cfg.clientHost,
        port: cfg.clientPort,
        path: '/datas/' + p,
        method: 'GET'
    }

    http.request(opts, function(res) {
        var buffer = new Buffer(parseInt(res.headers['content-length'], 10))
        var offset = 0

        res.on('data', function(data) {
            data.copy(buffer, offset)
            offset += data.length
        })

        res.on('end', function() {
            cb({
                path: p,
                statusCode: res.statusCode,
                headers: res.headers,
                body: buffer
            })
        })
    }).on('error', function(err) {
        console.info('error', err)
    }).end()
}
