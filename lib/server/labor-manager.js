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
    self.waitingOrders = {}
}

inherits(LaborManager, EventEmitter)

LaborManager.prototype.addLabor = function(labor){
    var self = this
    var id = labor.id
    self.labors[id] = labor

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
        self.handleWaitingOrders()
    })

    self.handleWaitingOrders()
}

LaborManager.prototype.removeLabor = function(laborId){
    var self = this
    var labor
    if(laborId in self.labors){
        labor = self.labors[laborId]
        delete self.labors[laborId]
    }else if(laborId in self.busyLabors){
        labor = self.busyLabors[laborId]
        delete self.busyLabors[laborId]
    }

    // add not finished orders to self.waitingOrders to get match again
    _.each(labor.orders, function(order, orderId){
        self.waitingOrders[orderId] = order
    })
    self.handleWaitingOrders()
}

LaborManager.prototype.addOrder = function(order) {
    var self = this
    self.waitingOrders[order.id] = order
    self.handleWaitingOrders()

    var orderId = order.id
    order.on('destroy', function(){
        self.removeOrder(orderId)
    })
}

LaborManager.prototype.removeOrder = function(orderId){
    var self = this
    delete self.waitingOrders[orderId]
}

LaborManager.prototype.handleWaitingOrders = function(){
    var self = this
    var waitingOrders = self.waitingOrders
    _.each(waitingOrders, function(order, orderId){
        var waitingPlatforms = order.waitingPlatforms
        _.each(waitingPlatforms, function(v, platform){
            var labor = _.find(self.labors, function(labor){
                /*
                 * TODO
                 * 
                 * a cache such as cachedMatch = {platform:{matchedLabors}} may be helpful
                 * but manage these labors(because it may distroy) is not easy, should weigh this idea
                 */
                return isMatch(platform, labor.ua)
            })
            if(labor){
                order.addLabor(labor, platform)
                labor.addOrder(order)
            }
        })
        if(!_.keys(waitingPlatforms).length){
            delete waitingOrders[orderId]
        }
    })
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
    logger.debug('avilable browsers: ' + _.keys(rt))
    return rt
}

function isMatch(platform, ua){
    platform = formatPlatform(platform)
    ua = formatUa(ua)
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
