'use strict';

var io = require('socket.io-client')
var utils = require('../utils')

module.exports = function(cfg) {
    var socket = io.connect('http://' + cfg.serverHost + ':' + cfg.serverPort + '/list')
    socket.on('connect', function () {
        socket.on('labors', function(labors) {
            labors = labors.map(function(labor) {
                return '    ' + utils.parseUserAgent(labor)[1]
            })

            if (labors.length) {
                console.info('The active browser list:')
                labors.forEach(function(labor) {
                    console.info(labor)
                })
            } else {
                console.warn('Not found active browser.')
            }
            socket.emit('disconnect')
            process.exit(0);
        })
    })
}
