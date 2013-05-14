'use strict';

var fs = require('fs')
var path = require('path')
var colorful = require('colorful')

exports.getExternalIpAddress = function() {
    var interfaces = require('os').networkInterfaces()
    var addresses = []
    Object.keys(interfaces).forEach(function(name) {
        var iface = interfaces[name]
        for (var i in iface) {
            var node = iface[i]
            if (node.family === 'IPv4' && node.internal === false) {
                addresses = addresses.concat(node)
            }
        }
    })
    if (addresses.length > 0) {
        return addresses[0].address
    }
}

exports.mix = function(target, src, ow) {
    target = target || {}
    var len = arguments.length
    var srcEnd = len - 1
    var lastArg = arguments[len - 1]

    if ( typeof lastArg === 'boolean' || typeof lastArg === 'number') {
        ow = lastArg
        srcEnd--
    } else {
        ow = false
    }

    for (var i = 1; i <= srcEnd; i++) {
        var current = arguments[i] || {}
        for (var j in current) {
            if (ow || typeof target[j] === 'undefined') {
                target[j] = current[j]
            }
        }
    }

    return target
}
var print = exports.print = function(str, color) {
    str = str || ''
    str = color ? colorful[color](str) : str
    process.stdout.write(str)
}

exports.println = function(str, color) {
    print(str, color)
    process.stdout.write('\n')
}

exports.home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME

