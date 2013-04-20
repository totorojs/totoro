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
    self.waitingTasks = []
    self.handleWaitingTasks()
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
    delete self.labors[laborId]
}

LaborManager.prototype.viewLabors = function(){
    var self = this
    var rt = {}
    var fn = function(labor, id, labors){
        var ua = labor.ua.toString()
        rt[ua] = (rt[ua] || 0) + 1
    }
    _.each(self.labors, fn)
    _.each(self.busyLabors, fn)
    logger.debug('avilable browsers: ' + JSON.stringify(rt))
    return rt
}

LaborManager.prototype.handleWaitingTasks = function(){
    var self = this
    var waitingTasks = self.waitingTasks
    if(waitingTasks.length){
        var task = waitingTasks.shift()
        var platform = task[0]
        var order = task[1]
        var labor = _.find(self.labors, function(labor){
            return isMatch(platform, labor.ua)
        }) 
        if(labor){
            order.addLabor(labor, platform)
            labor.addOrder(order)
        }else{
            waitingTasks.push(task)
        }
    }
    // TODO if no waiting tasks, cancel timeout, util new task added, then restart it
    setTimeout(function(){
        self.handleWaitingTasks()
    },20)
}

LaborManager.prototype.take = function(order) {
    var self = this
    var platforms = order.platforms
    var newTasks = _.map(platforms, function(platform){
        return [platform, order]
    })
    self.waitingTasks = self.waitingTasks.concat(newTasks)
}

function isMatch(platform, ua){
    var platform = formatPlatform(platform)
    var ua = formatUa(ua)
    var matched = true
    _.each(ua, function(v, k, ua){
        /*
         * TODO:
         * 
         * need to fix a potential bug
         * 'mobile_safari'.match('safari') == true
         * this is not as expected
         */
        if(platform[k] && !v.toLowerCase().match(platform[k].toLowerCase())){
            matched = false
        }
    })
    return matched
}

function formatPlatform(platform){
    var arr = platform.split('/')
    var len = arr.length
    var obj
    // 'os/name/version'
    if(len === 3){
        obj = {
            os: arr[0],
            name: arr[1],
            version: arr[2]
        }
    }else if(len ===2){
        // 'name/version'
        if(arr[1].match(/^(\d+\.){0,2}\d+$/g)){
            obj = {
                name: arr[0],
                version: arr[1]
            }
        // 'os/name'
        }else{
            obj = {
                os: arr[0],
                name: arr[1]
            }
        }
    // 'name'
    }else{
        obj = {
            name: arr[0]
        }
    }
    
    if(obj.name === 'ff'){
        obj.name = 'firefox'
    }
    
    return obj
}

function formatUa(ua){
    return {
        os: ua.os.family,
        name: ua.family,
        version: ua.toVersion()
    }
}
