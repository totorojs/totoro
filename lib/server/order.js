'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var path = require('path')
var _ = require('underscore')

var logger = require('../logger')

module.exports = Order

function Order(id, socket){
    var self = this
    if (!( self instanceof Order)) {
        return new Order(socket)
    }
    self.id = id
    self.socket = socket
    self.labors = {}
    self.finishedLabors = {}
    self.reports = []

    socket.on('order', function(data){
        self.init(data)
    })
    socket.on('disconnect', function(){
        self.destroy()
    })

    setInterval(function(){
        if(self.reports.length){
            var data = self.reports
            self.reports = []
            socket.emit('report', data)
            logger.debug('order: ' + self.id + ' emit report data')
        }
    }, 1000)
}

inherits(Order, EventEmitter)

Order.prototype.init = function(data){
    var self = this
    self.host = data.host
    self.port = data.port
    self.runner = data.runner
    self.platforms = data.platforms
    logger.debug('order init: ' + self.id + ' ' + JSON.stringify(data))
    self.emit('init')
}

Order.prototype.addLabor = function(labor){
    var self = this
    self.labors[labor.id] = {
        platform: labor.ua.toString(),
        instance: labor
    }
    self.report({
        action: 'addLabor',
        laborId: labor.id,
        info: {
            platform: labor.ua.toString()
        }
    })
}

Order.prototype.removeLabor = function(laborId){
    var self = this
    var socket = self.socket
    delete self.labors[laborId]
    self.report({
        action: 'removeLabor',
        laborId: laborId
    })
    logger.debug('order: ' + self.id + ' remove not finished labor: ' + laborId)
    self.checkIfEndAll()
}

Order.prototype.report = function(data){
    var self = this
    self.reports.push(data)
    if(data.action === 'end'){
        var laborId = data.laborId
        self.finishedLabors[laborId] = self.labors[laborId]
        delete self.labors[laborId]
        self.checkIfEndAll()
    }
}

Order.prototype.checkIfEndAll = function(){
    var self = this
    if(_.keys(self.labors).length === 0){
        self.reports.push({action: 'endAll'})
    }
}

Order.prototype.destroy = function(){
    var self = this
    _.each(self.labors, function(labor, key, labors){
        labor.instance.removeOrder(self.id)
    })
    logger.debug('order destory: ' + self.id)
    self.emit('destroy')
    delete this
}