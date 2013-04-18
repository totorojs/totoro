'use strict';

var http = require('http')
var _ = require('underscore')

var utils = require('../utils')
var logger = require('../logger')
var println = require('../utils/colorful-print').println

module.exports = function(cfg) {

    var listUrl = 'http://' + cfg.serverHost + ':' + cfg.serverPort + '/list'
    
    http.get(listUrl, function(res) {
        var data = ''
        res.on('data', function(chunk) {
            data += chunk
        })
        res.on('end', function() {
            var labors = JSON.parse(data)
            labors = _.map(labors, function(amount, ua, labors){
                return {
                    ua: ua,
                    amount: amount
                }
            })
            if(labors.length){
                println('active browsers:', 'cyan')
                _.each(labors, function(labor, idx, labors){
                    println('    ' + labor.ua + ' (' + labor.amount + ')', 'cyan')
                })
            }else{
                println('no active browser', 'red')
            }
        })
    }).on('error', function(e) {
        logger.error('server is not avilable, please check your config or try again later.')
    })
}
