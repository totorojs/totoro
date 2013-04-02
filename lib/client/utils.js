'use strict';

var fs = require('fs')
var path = require('path')
var _ = require('underscore')

var logger = require('./logger')

exports.getExternalIpAddress = function(){
    var interfaces = require('os').networkInterfaces()
    var addresses = []
    _.each(interfaces, function(iface, name){
        addresses = addresses.concat(
            _.filter(iface, function(node){ 
                return node.family === "IPv4" && node.internal === false
            })
        );
    })
    if(addresses.length > 0){
        return addresses[0].address;
    }
}

exports.mix = function(target, src, ow){
    target = target || {}
    for(var i in src){
        if(ow || typeof target[i] == 'undefined'){
            target[i] = src[i]
        }
    }
    return target
}

var findFiles = exports.findFiles = function(dir, filter){
    var files = []
    dir = path.resolve(dir)
    filter = perfectFilter(filter)
    if (path.basename(dir)[0] !== '.') {
        fs.readdirSync(dir).forEach(function(name, idx, list){
            var p = path.join(dir, name)
            if(fs.statSync(p).isFile() && filter(name)){
                files.push(p)
            }else if(fs.statSync(p).isDirectory()){
                files = files.concat(findFiles(p, filter))
            }
        })
    }
    return files
}

function perfectFilter(filter) {
    if (!filter) {
        return function() {
          return true
        }
    }
    if (_.isRegExp(filter)) {
        return function(file) {
            return path.basename(file).match(filter)
        }
    }
    return filter
}
