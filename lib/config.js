'use strict';

var fs = require('fs')
var path = require('path')
var colorful = require('colorful')
var common = require('totoro-common')
var logger = common.logger

var globalCfgPath = path.join(common.home, '.totoro', 'config.json')

module.exports = function(cfg) {
    var list = true
    var del = false
    var delKeys = []
    var globalCfg = loadCfg()

    Object.keys(cfg).forEach(function(key) {
        var value = cfg[key]
        if (value === null) return

        if (value === '') {
            del = true
            list = false
            delKeys.push(key)
        } else {
            globalCfg[key] = value
            list = false
        }
    })

    if (list) {
        listCfg(globalCfg)
    } else if (del) {
        delCfg(delKeys, globalCfg)
    } else {
        updateCfg(globalCfg)
    }

}

function listCfg(cfg) {
    if (Object.keys(cfg).length === 0) {
        console.log('\n  No global configuration.\n')
    } else {
        console.log()
        Object.keys(cfg).forEach(function(key) {
            console.log('  ' + unCamelcase(key) + '=' + cfg[key])
        })
        console.log()
    }
}

function delCfg(keys, cfg) {
    keys.forEach(function(key) {
        delete cfg[key]
    })

    writeCfg(cfg)
}

function loadCfg() {
    var cfg = common.readCfgFile(globalCfgPath) || {}
    if (Object.keys(cfg).length === 0) {
        writeCfg(cfg)
    }
    return cfg
}

function updateCfg(cfg) {
    var globalCfg = loadCfg()

    Object.keys(cfg).forEach(function(key) {
        globalCfg[key] = cfg[key]
    })

    writeCfg(cfg)
}

function writeCfg(cfg) {
    if (!fs.existsSync(path.dirname(globalCfgPath))) {
        fs.mkdirSync(path.dirname(globalCfgPath))
    }

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
