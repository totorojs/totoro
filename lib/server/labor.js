'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var useragent = require('useragent')

var logger = require('../logger')

module.exports = Labor

function Labor(id, socket, data) {
    var self = this
    self.id = id
    self.socket = socket
    self.ua = useragent.lookup(data.ua)

    self.orders = {}
    self.isBusy = false

    socket.on('report', function(data) {
        self.report(data)
    })
    socket.on('ping', function() {
        socket.emit('ping')
    })
    socket.on('disconnect', function(data) {
        self.destroy()
    })

    logger.debug('new labor: ' + self.id + ' [' + self.ua.toString() + ']')
}

inherits(Labor, EventEmitter)

Labor.prototype.addOrder = function(order) {
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
    if (Object.keys(self.orders).length === 5) {
        self.isBusy = true
        self.emit('busy')
        logger.debug('labor: ' + self.id + ' is busy')
    }
}

Labor.prototype.removeOrder = function(orderId) {
    var self = this
    var socket = self.socket

    /*
     * NOTE
     * 
     * self.removeOrder() can be triggered by several conditions
     * such as:
     *     - Order destroy
     *     - browser end Labor.removeOrder()
     * so, to avoid loop caused by custom event, need to check it first
     */
    if(orderId in self.orders) {
        delete self.orders[orderId]
        socket.emit('removeOrder', orderId)
        logger.debug('labor: ' + self.id + ' remove order: ' + orderId)

        if (self.isBusy === true) {
            self.isBusy = false
            self.emit('notBusy')
            logger.debug('labor: ' + self.id + ' is not busy')
        }
    }
}

Labor.prototype.report = function(data) {
    var self = this
    var orders = self.orders
    data.forEach(function(item) {
        var orderId = item.orderId
        var order = orders[orderId]
        /*
         * NOTE
         *
         * when client disconnect, Labor will remove this unfinished Order
         * but browser not know this sync
         * it may send report before it recieves the instruction
         * so, need to check it first
         */
        if (order) {
            item.laborId = self.id
            ;delete item.orderId
            order.report(item)

            if (item.action === 'end') {
                delete orders[orderId]
                logger.debug('labor: ' + self.id + ' finish order: ' + orderId)
            }
        }
    })
}

Labor.prototype.destroy = function() {
    var self = this
    var laborId = self.id
    logger.debug('labor destroy: ' + self.id)
    Object.keys(self.orders).forEach(function(orderId) {
        self.orders[orderId].removeLabor(laborId)
    })
    self.emit('destroy')
}
