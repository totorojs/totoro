'use strict';

var fs = require('fs')
var path = require('path')
var common = require('totoro-common')
var logger = common.logger

var globalCfgPath = path.join(common.home, '.totoro', 'config.json')

module.exports = function(cfg) {
    var list = true
    var keys = []
    var globalCfg = loadGlobalCfg()

    Object.keys(cfg).forEach(function(key) {
        var value = cfg[key]

        if (value) {
            globalCfg[key] = value
            list = false
        } else {
            keys.push(key)
        }
    })

    if (list) {
        outputGlobalCfg(keys, globalCfg)
    } else {
        updateGlobalCfg(globalCfg)
    }

}

function outputGlobalCfg(keys, globalCfg) {
    if (keys.length === 0) keys = Object.keys(globalCfg)

    keys.forEach(function(key) {
        console.info(unCamelcase(key) + '=' + globalCfg[key])
    })
}

function loadGlobalCfg() {
    return common.readCfgFile(globalCfgPath) || {}
}

function updateGlobalCfg(cfg) {
    var globalCfg = loadGlobalCfg()

    Object.keys(cfg).forEach(function(key) {
        globalCfg[key] = cfg[key]
    })

    fs.writeFileSync(globalCfgPath, JSON.stringify(cfg))
}

function unCamelcase(str) {
    return str.split(/([A-Z])/).reduce(function(str, word){
        if (/[A-Z]/.test(word)) {
            return str + '-' + word.toLowerCase()
        } else {
            return str + word
        }
    })
}
