'use strict';

var path = require('path')
var fs = require('fs')
var async = require('async')
var _ = require('underscore')

var logger = require('../logger')
var Client = require('../client/client')
var Contractor = require('../server/server')
var list = require('../client/list')
var utils = require('../utils')
var availableAdapters = require('../client/adapt').availableAdapters


var ip = utils.getExternalIpAddress()

var clientCfg = {
    tests: undefined,
    runner: undefined,
    adapter:undefined,
    override: false,
    browsers: ['chrome', 'firefox', 'safari', 'ie/9', 'ie/8', 'ie/7', 'ie/6'],
    clientRoot: undefined,
    timeout: 5,
    clientHost: ip,
    clientPort: '9998',
    serverHost: '10.15.52.87',
    serverPort: '9999'
}

var serverCfg = {
    serverHost : ip,
    serverPort : '9999'
}

// parse config
var globalCfg = getCfg(path.join(utils.home, '.totoro', 'config.json'))
var projectCfg = getCfg(path.join(process.cwd(), 'totoro-config.json'))

mixCfg(clientCfg, globalCfg)
mixCfg(clientCfg, projectCfg)

mixCfg(serverCfg, globalCfg)
mixCfg(serverCfg, projectCfg)


module.exports = function(commander) {
    if (commander.server) {
        mixCommander(serverCfg, commander)
        ;new Contractor(serverCfg)
    } else if (commander.list) {
        mixCommander(clientCfg, commander)
        list(clientCfg)
    } else {
        mixCommander(clientCfg, commander)
        handleClientOption()
        var adapter = clientCfg.adapter
        if (adapter) {
            if (availableAdapters.indexOf(adapter) < 0 && !utils.isAbsolute(adapter)) {
                clientCfg.adapter = path.join(process.cwd(), adapter)
            }
        }

        if (!clientCfg.clientRoot) {
            clientCfg.clientRoot = guessRoot(clientCfg.testsDir)
        }else{
            clientCfg.clientRoot = path.resolve(clientCfg.clientRoot)
        }

        new Client(clientCfg)
    }
}

function guessRoot(testsDir) {
    // TODO
    var root = path.join(path.resolve(testsDir), '../')
    logger.debug('guess root is "' + root + '"')
    return root
}

function handleClientOption() {
    ['runner', 'platforms'].map(function(name) {
        return require('./' + name)
    }).forEach(function(option) {
        option(clientCfg)
    })
}

function mixCommander(cfg, commander) {
    _.keys(cfg).forEach(function(key) {
        if (commander[key]) {
            cfg[key] = commander[key]
        }
    })
    return cfg
}

function mixCfg(target, src) {
    utils.mix(target, src, true)
}

function getCfg(cfgPath) {
    var cfg = null
    if (!fs.existsSync(cfgPath)) {
        return {}
    }

    cfg = fs.readFileSync(cfgPath) + ''

    if (!cfg) {
        return {}
    }

    try {
        cfg = JSON.parse(fs.readFileSync(cfgPath))
    } catch(e) {
        logger.warn('parse global config error! (' + cfgPath + ')')
    }
    return cfg || {}
}
