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
                console.info(colorful.cyan('  Active browsers:'))
                Object.keys(labors).sort().forEach(function(item, index, list) {
                    console.info('    ' + item + colorful.gray(' [' + labors[item] + ']'))
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

