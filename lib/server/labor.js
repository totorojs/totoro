'use strict';

var EventEmitter = require('events').EventEmitter
var useragent = require('useragent')

module.exports = Labor

function Labor(socket){
    var self = this
    if (!( self instanceof Labor)) {
        return new Labor(socket)
    }
    self.id = socket.id
    self.socket = socket
    
    socket.on('ready', function(data){
        self.ready(data)
    })
    socket.on('disconnect', function(data){
        self.resign()
    })
}

Labor.prototype.__proto__ = EventEmitter.prototype

Labor.prototype.ready = function(data){
    var self = this
    self.ua = useragent.lookup(data)
    console.log(self.ua.toString())
    self.emit('ready')
}

Labor.prototype.work = function(cfg){
    
}

Labor.prototype.resign = function(){
    var self = this
    
    self.emit('resign')
}