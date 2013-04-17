'use strict';

var http = require('http')
var utils = require('../utils')
var logger = require('../logger')

module.exports = function(cfg) {

    var listUrl = 'http://' + cfg.serverHost + ':' + cfg.serverPort + '/list')
    
    http.get(listUrl, function(res) {

        /**
        labors = labors.map(function(labor) {
            return '    ' + utils.parseUserAgent(labor)[1]
        })

        if (labors.length) {
            console.info('The active browser list:')
            labors.forEach(function(labor) {
                console.info(labor)
            })
        } else {
            console.warn('Not found active browser.')
        }
        **/
    }).on('error', function(e) {
        logger.error('server is not avilable, please check your config or try again later.')
    })
}
