'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var _ = require('underscore')

var logger = require('../logger')

module.exports = LaborManager

function LaborManager(){
    var self = this
    self.labors = {}
    self.busyLabors = {}
}

inherits(LaborManager, EventEmitter)

LaborManager.prototype.addLabor = function(labor){
    var self = this
    var id = labor.id
    labor.on('init', function(){
        self.labors[id] = labor
    })
    labor.on('destroy', function(){
        self.removeLabor(id)
    })
    labor.on('busy', function(){
        delete self.labors[id]
        self.busyLabors[id] = labor
    })
    labor.on('notBusy', function(){
        delete self.busyLabors[id]
        self.labors[id] = labor
    })
}

LaborManager.prototype.removeLabor = function(laborId){
    var self = this
    // labor may be removed before init or received an incorrect laborId
    if(laborId in self.labors){
        delete self.labors[laborId]
    }
}

LaborManager.prototype.selectLabors = function(platforms){
    var self = this
    var selectedLabors
    if(platforms){
        // TODO filter labors according to platforms
        selectedLabors = self.autoSelectLabors()
    }else{
        selectedLabors = self.autoSelectLabors()
    }
    return selectedLabors
}

LaborManager.prototype.autoSelectLabors = function(){
    var self = this
    var rt = {}
    _.each(self.labors, function(labor, id, labors){
        var ua = labor.ua.toString()
        if(!(ua in rt)){
            rt[ua] = labor
        }
    })
    return rt
}

LaborManager.prototype.viewLabors = function(){
    var self = this
    var rt = {}
    _.each(self.labors, function(labor, id, labors){
        var ua = labor.ua.toString()
        rt[ua] = (rt[ua] || 0) + 1
    })
    logger.debug('avilable browsers: ' + JSON.stringify(rt))
    return rt
}