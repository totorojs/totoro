'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var useragent = require('useragent')
var _ = require('underscore')

var logger = require('./logger')

module.exports = Labor

function Labor(id, socket){
    var self = this
    if (!( self instanceof Labor)) {
        return new Labor(socket)
    }
    self.id = id
    self.socket = socket
    self.orders = {}
    
    socket.on('ready', function(data){
        self.ready(data)
    })
    socket.on('report', function(data){
        self.report(data)
    })
    socket.on('ping', function(){
        socket.emit('ping')
    })
    socket.on('disconnect', function(data){
        self.resign()
    })
    logger.debug('new labor: ' + self.id)
}

inherits(Labor, EventEmitter)

Labor.prototype.ready = function(data){
    var self = this
    self.ua = useragent.lookup(data)
    logger.debug('labor ready: ' + self.id + ' [' + self.ua.toString() + ']')
    self.emit('ready')
}

Labor.prototype.addOrder = function(order){
    var self = this
    var orderId = order.id
    var runner = order.runner
    self.orders[orderId] = order
    self.socket.emit('newTask', {
        orderId: orderId,
        runner: runner
    })
}

Labor.prototype.report = function(data){
    var self = this
    var orders = self.orders
    _.each(data, function(item){
        var orderId = item.orderId
        var order = orders[orderId]
        delete item.orderId
        item.laborId = self.id
        if(item.action === 'end'){
            item.platform = self.ua.toString()
        }
        order.report(item)
    })
}

Labor.prototype.resign = function(){
    var self = this
    logger.debug('delete labor: ' + self.id)
    // TODO destroy
    self.emit('resign')
}