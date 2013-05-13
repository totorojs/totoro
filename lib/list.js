'use strict';

var http = require('http')

var utils = require('./utils')
var logger = require('./logger')
var print = utils.print
var println = utils.println

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
                println()
                println('  active browsers:', 'cyan')
                for (var i in labors) {
                    print('    ' + i)
                    println(' [' + labors[i] + ']', 'gray')
                }
                println()
            } else {
                println('  no active browser', 'red')
            }
        })
    }).on('error', function(e) {
        logger.error('server is not available, please check your config or try again later.')
    })
}
