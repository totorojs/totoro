'use strict';

var EventEmitter = require('events').EventEmitter

module.exports = Order

function Order(socket){
    var self = this
    if (!( self instanceof Order)) {
        return new Order(socket)
    }
    self.id = socket.id
    self.socket = socket
    
    socket.on('init', function(data){
        self.init()
    })
}

Order.prototype.__proto__ = EventEmitter.prototype

Order.prototype.init = function(data){
    console.log(data)
}