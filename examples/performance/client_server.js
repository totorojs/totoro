'use strict';

var express = require('express')
var path = require('path')
var http = require('http')
var common = require('totoro-common')
var io = require('socket.io-client')

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
        var opts = {
            hostname: cfg.clientHost,
            port: cfg.clientPort,
            path: '/datas/' + info,
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
                socket.emit('proxyData', {
                    path: info,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: buffer
                })
            })
        }).on('error', function(err) {
            console.info('error', err)
        }).end()
    })

    var socket2 = io.connect(
            'http://' + cfg.serverHost + ':' + cfg.serverPort + '/http')

    socket2.on('begin', function() {
        socket2.emit('begin', {
            hostname: cfg.clientHost,
            port: cfg.clientPort
        })
    })
})
