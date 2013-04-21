'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var path = require('path')
var _ = require('underscore')

var logger = require('../logger')

module.exports = Order

function Order(id, socket){
    var self = this
    self.id = id
    self.socket = socket
    self.labors = {/*platform: {instance: labor, isFinished: false}*/}
    self.reports = []

    socket.on('init', function(data){
        self.init(data)
    })
    socket.on('disconnect', function(){
        self.destroy()
    })

    setInterval(function(){
        self.emitReports()
    }, 950)
}

inherits(Order, EventEmitter)

Order.prototype.init = function(data){
    var self = this
    self.host = data.host
    self.port = data.port
    self.runner = data.runner
    self.platforms = data.platforms
    
    _.each(self.platforms, function(platform){
        self.labors[platform] = undefined
    })
    
    logger.debug('order init: ' + self.id + ' ' + JSON.stringify(data))
    self.emit('init')
}

Order.prototype.addLabor = function(labor, platform){
    var self = this
    self.labors[platform] = {
        isFinished: false,
        instance: labor
    }
    self.report({
        action: 'addLabor',
        platform: platform,
        info: {
            laborId: labor.id,
            ua: labor.ua.toString()
        }
    })
    logger.debug('order: ' +self.id +
            ' add labor: ' + labor.id +
            ' matched platform: ' + platform)
}

Order.prototype.removeLabor = function(laborId){
    var self = this
    var platform = self.findMatchedPlatform(laborId)
    self.labors[platform] = undefined
    self.report({
        action: 'removeLabor',
        platform: platform
    })
    logger.debug('order: ' + self.id +
            ' remove labor: ' + laborId)
    self.checkIsEndAll()
}

Order.prototype.report = function(data){
    var self = this
    var action = data.action
    if(action !== 'addLabor' && action !== 'removeLabor'){
        var platform = self.findMatchedPlatform(data.laborId)
        data.platform = platform
        delete data.laborId
    }
    self.reports.push(data)
    if(data.action === 'end'){
        self.labors[platform].isFinished = true
        self.checkIsEndAll()
    }
}

Order.prototype.checkIsEndAll = function(){
    var self = this
    var labors = self.labors
    for(var i in labors){
        if(!(labors[i] && labors[i].isFinished)){
            return
        }
    }
    self.report({action: 'endAll'})
}

Order.prototype.emitReports = function(){
    var self = this
    var socket = self.socket
    if(self.reports.length){
        var data = self.reports
        self.reports = []
        socket.emit('report', data)
        logger.debug('order: ' + self.id + ' emit reports data')
    }
}

Order.prototype.findMatchedPlatform = function(laborId){
    var self = this
    var labors = self.labors
    var platform
    for(var i in labors){
        var v = labors[i]
        if(v && v.instance.id === laborId){
            platform = i
            break
        }
    }
    return platform
}

Order.prototype.destroy = function(){
    var self = this
    _.each(self.labors, function(labor, key, labors){
        labor.instance.removeOrder(self.id)
    })
    logger.debug('order: ' + self.id + ' destroy')
    self.emit('destroy')
}