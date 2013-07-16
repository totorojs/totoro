'use strict';

var express = require('express')
var path = require('path')
var http = require('http')
var common = require('totoro-common')
var io = require('socket.io-client')
var jsonOverTCP = require('json-over-tcp')
var net = require('net')


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
        console.info('coonect000')
        socket.on('data', function(data) {
            //console.info('data------>', data)

            getInfo(cfg, data.path, function(info) {
                //console.info('---------->info---->', info.path)
                socket.write(info)
            })
        })
    })

    var socket4 = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/net')

    socket4.on('begin', function() {
        console.info('---------net socket begin--')
        socket4.emit('begin', {
            hostname: cfg.clientHost,
            port: 9996
        })
    })

    var netServer = net.createServer(function(c) { //'connection' listener
        console.log('net server connected')

        c.on('data', function(buf) {
            console.info('net data----->', buf.length, buf + '')
            getInfo(cfg, buf + '', function(info) {
                console.info('--------net-->info---->', info.body)
                socket.write(info.body + '\r\n')
            })
        })

        c.on('end', function() {
          console.log('server disconnected')
        })
        c.pipe(c)
    })

    netServer.listen(9996)

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
