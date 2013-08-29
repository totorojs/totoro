'use strict';

var fs = require('fs')
var path = require('path')
var colorful = require('colorful')
var common = require('totoro-common')

var globalCfgPath = path.join(common.home, '.totoro', 'config.json')


module.exports = function(cfg) {
    var globalCfg = common.readCfgFile(globalCfgPath)
    var keys = Object.keys(cfg || {})

    if (keys.length) {
        keys.forEach(function(key) {
            var value = cfg[key]
            if (value === '') {
                delete globalCfg[key]
            } else {
                globalCfg[key] = value
            }
        })
        common.writeCfgFile(globalCfgPath, globalCfg)

    } else {
        list(globalCfg)
    }
}


function list(cfg) {
    if (Object.keys(cfg).length) {
        console.log()
        Object.keys(cfg).forEach(function(key) {
            console.log('  ' + common.unCamelcase(key) + '=' + cfg[key])
        })
        console.log()
    } else {
        console.log('\n  No global configuration.\n')
    }
}

