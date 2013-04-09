'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var path = require('path')
var _ = require('underscore')

var logger = require('./logger')

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
    self.finished = false
    
    socket.on('data', function(data){
        data = JSON.parse(data)
        if(data.action === 'order'){
            self.init(data.info)
        }
    })
}

inherits(Order, EventEmitter)

Order.prototype.init = function(data){
    var self = this
    self.host = data.host
    self.port = data.port
    self.runner = data.runner
    self.platforms = data.platforms
    
    setInterval(function(){
        if(self.reports.length){
            var temp = self.reports
            self.reports = []
            self.socket.write(JSON.stringify(temp), function(){
                if(_.keys(self.labors).length === 0){
                    self.destroy()
                }
            })
        }
    }, 1000)
            
    logger.debug('init order: ' + self.id + ' ' + JSON.stringify(data))
    self.emit('init')
}

Order.prototype.addLabor = function(labor){
    var self = this
    self.labors[labor.id] = labor
}

Order.prototype.report = function(data){
    var self = this
    var socket = self.socket
    var reports = self.reports
    reports.push(data)
    var laborId = data.laborId
    if(data.action === 'end'){
        self.finishedLabors[laborId] = self.labors[laborId]
        delete self.labors[laborId]
        if(_.keys(self.labors).length === 0){
            reports.push({action: 'endAll'})
        }
    }
}

Order.prototype.destroy = function(){
    var self = this
    logger.debug('destory order: ' + self.id)
    self.socket.destroy()
    delete this
}