'use strict';

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var path = require('path')
var _ = require('underscore')

var logger = require('../logger')

module.exports = Order

function Order(id, socket, data) {
    var self = this
    self.id = id
    self.socket = socket
    socket.on('disconnect', function() {
        self.destroy()
    })

    self.host = data.host
    self.port = data.port
    self.runner = data.runner
    self.browsers = data.browsers
    self.timeout = data.timeout

    self.waitingBrowsers = {/*
        browser: true
    */}
    _.each(self.browsers, function(browser) {
        self.waitingBrowsers[browser] = true
    })
    self.labors = {/*
        laborId:{
            browser: browser,
            isFinished: false,
            instance: labor
        }
    */}
    self.reports = []

    setInterval(function() {
        self.emitReports()
    }, 950)

    logger.debug('new order: ' + self.id + ' [' + self.browsers + ']')
}

inherits(Order, EventEmitter)

Order.prototype.addLabor = function(labor, browser) {
    var self = this
    var laborId = labor.id
    ;delete self.waitingBrowsers[browser]
    self.labors[laborId] = {
        browser: browser,
        isFinished: false,
        instance: labor
    }
    self.report({
        action: 'addLabor',
        browser: browser,
        info: {
            laborId: labor.id,
            ua: labor.ua.toString()
        }
    })
    clearTimeout(self.checkIsEndAllTimer)
    logger.debug('order: ' +self.id +
            ' add labor: ' + labor.id +
            ' matched browser: ' + browser)
}

Order.prototype.removeLabor = function(laborId) {
    var self = this
    var labors = self.labors

    if (laborId in labors) {
        var browser = labors[laborId].browser
        self.waitingBrowsers[browser] = true
        ;delete self.labors[laborId]

        self.report({
            action: 'removeLabor',
            browser: browser
        })
        logger.debug('order: ' + self.id +
                ' remove labor: ' + laborId)
    }
}

Order.prototype.report = function(data) {
    var self = this
    var action = data.action
    var laborId = data.laborId
    if (action !== 'addLabor' && action !== 'removeLabor') {
        data.browser = self.labors[laborId].browser
        ;delete data.laborId
    }
    self.reports.push(data)
    if (data.action === 'end') {
        self.labors[laborId].isFinished = true

        if (_.keys(self.waitingBrowsers).length) {
            // give more 30s to let not matched browsers have chance to match
            self.checkIsEndAllTimer = setTimeout(function() {
                self.checkIsEndAll()
            }, 30*1000)
        } else {
            self.checkIsEndAll()
        }
    }
}

Order.prototype.checkIsEndAll = function() {
    var self = this
    var labors = self.labors
    for (var i in labors) {
        if (!labors[i].isFinished) {
            return
        }
    }
    self.reports.push({action: 'endAll'})
}

Order.prototype.emitReports = function() {
    var self = this
    var socket = self.socket
    if (self.reports.length) {
        var data = self.reports
        self.reports = []
        socket.emit('report', data)
        logger.debug('order: ' + self.id + ' emit reports data')
    }
}

Order.prototype.destroy = function() {
    var self = this
    _.each(self.labors, function(labor, key, labors) {
        labor && labor.instance.removeOrder(self.id)
    })
    logger.debug('order: ' + self.id + ' destroy')
    self.emit('destroy')
}
