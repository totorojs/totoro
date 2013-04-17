'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var useragent = require('useragent')
var _ = require('underscore')

var logger = require('../logger')

module.exports = Labor

function Labor(id, socket){
    var self = this
    if (!( self instanceof Labor)) {
        return new Labor(socket)
    }
    self.id = id
    self.socket = socket
    self.orders = {}

    socket.on('init', function(data){
        self.init(data)
    })
    socket.on('report', function(data){
        self.report(data)
    })
    socket.on('ping', function(){
        socket.emit('ping')
    })
    socket.on('disconnect', function(data){
        self.destroy()
    })
}

inherits(Labor, EventEmitter)

Labor.prototype.init = function(data){
    var self = this
    self.ua = useragent.lookup(data)
    logger.debug('labor init: ' + self.id + ' [' + self.ua.toString() + ']')
    self.emit('init')
}

Labor.prototype.addOrder = function(order){
    var self = this
    var orderId = order.id
    var runner = order.runner
    self.orders[orderId] = order
    self.socket.emit('addOrder', {
        orderId: orderId,
        runner: runner
    })
    logger.debug('labor: ' + self.id + ' add order: ' + orderId)
}

Labor.prototype.removeOrder = function(orderId){
    var self = this
    var socket = self.socket
    socket.emit('removeOrder', orderId)
    delete self.orders[orderId]
    logger.debug('labor: ' + self.id + ' remove not finished order: ' + orderId)
}

Labor.prototype.report = function(data){
    var self = this
    var orders = self.orders
    _.each(data, function(item, idx, data){
        var orderId = item.orderId
        var order = orders[orderId]
        /*
         * NOTE:
         * 
         * need to check if this order is exist
         * when client disconnect, Labor will remove this unfinished Order
         * but browser not know this sync
         * it may send report before it recieves the instruction
         */
        if(order){
            item.laborId = self.id
            delete item.orderId
            order.report(item)

            if(item.action === 'end'){
                delete orders[orderId]
                logger.debug('labor: ' + self.id + ' finish order: ' + orderId)
            }
        }
    })
}

Labor.prototype.destroy = function(){
    var self = this
    var laborId = self.id
    logger.debug('labor destroy: ' + self.id)
    _.each(self.orders, function(order, id, orders){
        order.removeLabor(laborId)
    })
    self.emit('destroy')
}