'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var useragent = require('useragent')

var logger = require('./logger')

module.exports = Labor

function Labor(id, socket){
    var self = this
    if (!( self instanceof Labor)) {
        return new Labor(socket)
    }
    self.id = id
    self.socket = socket
    
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

Labor.prototype.addTask = function(opts){
    var self = this
    var socket = self.socket
    socket.emit('addTask', opts)
}

Labor.prototype.report = function(data){
    var self = this
    if(data.action === 'end'){
        // TODO test end
    }
    self.emit('report', data)
    console.log(data)
}

Labor.prototype.resign = function(){
    var self = this
    logger.debug('delete labor: ' + self.id)
    self.emit('resign')
}