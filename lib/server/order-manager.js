'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var _ = require('underscore')

var logger = require('../logger')

module.exports = OrderManager

function OrderManager() {
    var self = this
    self.orders = {}
}

inherits(OrderManager, EventEmitter)

OrderManager.prototype.addOrder = function(order) {
    var self = this
    var orders = self.orders
    var orderId = order.id
    orders[orderId] = order
    order.on('destroy', function() {
        delete orders[orderId]
    })
}

OrderManager.prototype.removeOrder = function(orderId) {
    var self = this
    ;delete self.orders[orderId]
}

OrderManager.prototype.getOrder = function(orderId) {
    var self = this
    return self.orders[orderId]
}
