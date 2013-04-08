'use strict';

var EventEmitter = require('events').EventEmitter

var logger = require('./logger')

module.exports = Order

function Order(id, socket){
    var self = this
    if (!( self instanceof Order)) {
        return new Order(socket)
    }
    self.id = id
    self.socket = socket
    
    socket.on('data', function(data){
        data = JSON.parse(data)
        self.init(data)
    })
}

Order.prototype.__proto__ = EventEmitter.prototype

Order.prototype.init = function(data){
    var self = this
    self.host = data.host
    self.port = data.port
    self.runner = data.runner
    logger.debug('init order: ' + JSON.stringify(data))
}

