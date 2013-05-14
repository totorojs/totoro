'use strict';

var http = require('http')
var color = require('colorful')
var logger = require('totoro-log')

module.exports = function(cfg) {

    var listUrl = 'http://' + cfg.serverHost + ':' + cfg.serverPort + '/list'

    http.get(listUrl, function(res) {
        var data = ''

        res.on('data', function(chunk) {
            data += chunk
        })

        res.on('end', function() {
            var labors = JSON.parse(data)
            
            if(Object.keys(labors).length) {
                console.log()
                console.log(color.cyan('  active browsers:'))
                for (var i in labors) {
                    console.log('    ' + i + color.gray(' [' + labors[i] + ']'))
                }
                console.log()
            } else {
                console.log(color.red('  no active browser'))
            }
        })
    }).on('error', function(e) {
        logger.error('server is not available, please check your config or try again later.')
    })
}
