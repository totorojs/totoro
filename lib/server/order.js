'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var path = require('path')

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
    self.tasks = {}
    
    socket.on('data', function(data){
        data = JSON.parse(data)
        self.init(data)
    })
}

inherits(Order, EventEmitter)

Order.prototype.init = function(data){
    var self = this
    self.host = data.host
    self.port = data.port
    self.runner = data.runner
    self.platforms = data.platforms
    logger.debug('init order: ' + JSON.stringify(data))
    self.emit('init')
}

Order.prototype.addLabor = function(labor){
    var self = this
    var id = labor.id
    var p = path.join('runner', id, self.runner)
    self.labors[id] = labor
    labor.addTask(p)
}
