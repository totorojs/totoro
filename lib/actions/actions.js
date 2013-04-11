'use strict';

var path = require('path')
var async = require('async')
var _ = require('underscore')
var Client = require('../client/client')
var Contractor = require('../server/contractor')
var utils = require('../utils')


var ip = utils.getExternalIpAddress()

var clientCfg = {
    tests: undefined,
    runner: undefined,
    adapter:undefined,
    override: false,
    platforms: undefined,
    clientRoot: undefined,
    timeout: undefined,
    clientHost: ip,
    clientPort: '9998',
    serverHost: ip,
    serverPort: '9999'
}

var serverCfg = {
    serverHost : ip,
    serverPort : '9999'
}

module.exports = function(commander) {
    if (commander.server) {
        mixCommander(serverCfg, commander);
        new Contractor(serverCfg);
    } else if (commander.list) {
    } else {
        mixCommander(clientCfg, commander);
        handleClientOption();
        new Client(clientCfg);
    }
}

function handleClientOption() {
    ['runner', 'platforms'].map(function(name) {
        return require('./' + name)
    }).forEach(function(option) {
        option(clientCfg);
    });
}

function mixCommander(cfg, commander) {
    _.keys(cfg).forEach(function(key) {
        if (commander[key]) {
            cfg[key] = commander[key];
        }
    })
    return cfg;
}