'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var _ = require('underscore')

var logger = require('../logger')

module.exports = LaborManager

function LaborManager(){
    var self = this
    if (!( self instanceof LaborManager)) {
        return new LaborManager(cfg)
    }
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
        logger.debug('remove labor: ' + laborId)
    }
}

LaborManager.prototype.selectLabor = function(platforms){
    var self = this
    if(platforms){
        // TODO
        return self.autoSelectLabor()
    }else{
        return self.autoSelectLabor()
    }
}

LaborManager.prototype.autoSelectLabor = function(){
    var self = this
    var rt = {}
    _.earch(self.labors, function(labor, id, labors){
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
    return rt
}