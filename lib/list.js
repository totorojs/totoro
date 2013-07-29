'use strict';

var http = require('http')
var common = require('totoro-common')
var colorful = require('colorful')

var logger = require('./logger')
var handleCfg = require('./handle-cfg')


// list all available browsers
module.exports = function(cfg) {
    cfg = handleCfg(cfg, true)

    var listUrl = 'http://' + cfg.serverHost + ':' + cfg.serverPort + '/list'
    http.get(listUrl, function(res) {
        var data = ''

        res.on('data', function(chunk) {
            data += chunk
        })

        res.on('end', function() {
            var labors = JSON.parse(data)
            if(Object.keys(labors).length) {
                console.info()
                Object.keys(labors).forEach(function(type, index, list) {
                    console.info(colorful.cyan('  ' +  upperFirst(type) + ':'))
                    var browsers = labors[type]
                    Object.keys(browsers).forEach(function(item) {
                        console.info('    ' + item + colorful.gray(' [' + browsers[item] + ']'))
                    })
                    console.info()
                })
                console.info()
            } else {
                console.info(colorful.red('  No active browser.'))
            }
        })
    }).on('error', function(e) {
        logger.error('Server is not available, please check your config or try again later.')
    })
}

function upperFirst(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1)
}

