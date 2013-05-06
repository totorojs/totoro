'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

var logger = require('../logger')

module.exports = LaborManager

function LaborManager() {
    var self = this
    self.labors = {}
    self.busyLabors = {}
    self.waitingOrders = {}
}

inherits(LaborManager, EventEmitter)

LaborManager.prototype.addLabor = function(labor) {
    var self = this
    var laborId = labor.id
    self.labors[laborId] = labor

    labor.on('destroy', function() {
        self.removeLabor(laborId)
    })
    labor.on('busy', function() {
        delete self.labors[laborId]
        self.busyLabors[laborId] = labor
    })
    labor.on('notBusy', function() {
        delete self.busyLabors[laborId]
        self.labors[laborId] = labor
        self.handleWaitingOrders()
    })

    self.handleWaitingOrders()

    self.emit('addLabor', labor)
}

LaborManager.prototype.removeLabor = function(laborId) {
    var self = this
    var labor
    if (laborId in self.labors) {
        labor = self.labors[laborId]
        ;delete self.labors[laborId]
    } else if (laborId in self.busyLabors) {
        labor = self.busyLabors[laborId]
        ;delete self.busyLabors[laborId]
    }

    if(labor && Object.keys(labor.orders).length){
        // add not finished orders to self.waitingOrders to get match again
        Object.keys(labor.orders).forEach(function(orderId) {
            self.waitingOrders[orderId] = labor.orders[orderId]
        })
        self.handleWaitingOrders()
    }

    self.emit('removeLabor', laborId)
}

LaborManager.prototype.addOrder = function(order) {
    var self = this
    self.waitingOrders[order.id] = order
    self.handleWaitingOrders()

    var orderId = order.id
    order.on('destroy', function() {
        self.removeOrder(orderId)
    })
}

LaborManager.prototype.removeOrder = function(orderId) {
    var self = this
    ;delete self.waitingOrders[orderId]
}

/*
 * NOTE
 *
 * when this method should be triggered?
 * 1. more orders wait
 *     - new order
 *     - labor destroyed with unfinished orders
 * 2. more labors available
 *     - new labor
 *     - busy labor to be not busy
 *
 * so, polling is not necessary, even if there are still waiting orders
 */
LaborManager.prototype.handleWaitingOrders = function() {
    var self = this
    var waitingOrders = self.waitingOrders
    Object.keys(waitingOrders).forEach(function(orderId) {
        var order = waitingOrders[orderId]
        var waitingBrowsers = order.waitingBrowsers
        Object.keys(waitingBrowsers).forEach(function(browser) {
            var labor
            for(var i in self.labors) {
                if(isMatch(browser, self.labors[i].ua)) {
                    labor = self.labors[i]
                    break
                }
            }
            if (labor) {
                order.addLabor(labor, browser)
                labor.addOrder(order)
            }
        })
        if (!Object.keys(waitingBrowsers).length) {
            delete waitingOrders[orderId]
        }
    })
}

LaborManager.prototype.list = function() {
    var self = this
    var rt = {}
    var fn = function(laborId, idx, labors) {
        var labor = labors[laborId]
        var ua = labor.ua.toString()
        rt[ua] = (rt[ua] || 0) + 1
    }
    Object.keys(self.labors).forEach(fn)
    Object.keys(self.busyLabors).forEach(fn)
    logger.debug('available browsers: ' + Object.keys(rt))
    return rt
}

function isMatch(browser, ua) {
    browser = formatBrowser(browser)
    ua = formatUa(ua)
    var matched = true
    Object.keys(ua).forEach(function(k) {
        var v = ua[k]
        /*
         * TODO:
         *
         * need to fix a potential bug
         * 'mobile_safari'.match('safari') == true
         * this is not as expected
         */
        if (browser[k] && !v.toLowerCase().match(browser[k].toLowerCase())) {
            matched = false
        }
    })
    return matched
}

function formatBrowser(browser) {
    var arr = browser.split('/')
    var len = arr.length
    var obj
    // 'os/name/version'
    if (len === 3) {
        obj = {
            os: arr[0],
            name: arr[1],
            version: arr[2]
        }
    } else if (len ===2) {
        // 'name/version'
        if (arr[1].match(/^(\d+\.){0,2}\d+$/g)) {
            obj = {
                name: arr[0],
                version: arr[1]
            }
        // 'os/name'
        } else {
            obj = {
                os: arr[0],
                name: arr[1]
            }
        }
    // 'name'
    } else {
        obj = {
            name: arr[0]
        }
    }

    if (obj.name === 'ff') {
        obj.name = 'firefox'
    }

    return obj
}

function formatUa(ua) {
    return {
        os: ua.os.family,
        name: ua.family,
        version: ua.toVersion()
    }
}
