'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var useragent = require('useragent')
var _ = require('underscore')

var logger = require('../logger')

module.exports = Labor

function Labor(socket, data){
    var self = this
    self.id = socket.id
    self.socket = socket
    self.ua = useragent.lookup(data.ua)

    self.orders = {}
    self.isBusy = false

    socket.on('report', function(data){
        self.report(data)
    })
    socket.on('ping', function(){
        socket.emit('ping')
    })
    socket.on('disconnect', function(data){
        self.destroy()
    })
    
    logger.debug('new labor: ' + self.id + ' [' + self.ua.toString() + ']')
}

inherits(Labor, EventEmitter)

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
    
    // TODO auto decide the max 
    if(_.keys(self.orders).length === 5){
        self.isBusy = true
        self.emit('busy')
        logger.debug('labor: ' + self.id + ' is busy')
    }
}

Labor.prototype.removeOrder = function(orderId){
    var self = this
    var socket = self.socket
    socket.emit('removeOrder', orderId)
    delete self.orders[orderId]
    logger.debug('labor: ' + self.id + ' remove order: ' + orderId)
    if(self.isBusy === true){
        self.isBusy = false
        self.emit('notBusy')
        logger.debug('labor: ' + self.id + ' is not busy')
    }
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