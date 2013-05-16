'use strict';

var http = require('http')
var color = require('colorful')
var logger = require('totoro-log')

var handleCfg = require('./handle-cfg')

module.exports = function(cfg) {
    cfg = handleCfg(cfg)
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
                console.info(color.cyan('  active browsers:'))
                Object.keys(labors).sort().forEach(function(item, index, list) {
                    console.info('    ' + item + color.gray(' [' + labors[item] + ']'))
                })
                console.info()
            } else {
                console.info(color.red('  no active browser'))
            }
        })
    }).on('error', function(e) {
        logger.error('server is not available, please check your config or try again later.')
    })
}
