'use strict';

var logging = require('winston')

var Adaptors = ['mocha', 'jasmine', 'qunit', 'yuitest', 'seajs']

module.exports = function(commander, options, cb) {
    var adaptor = commander.adaptor;
    if (adaptor) {
        if (Adaptors.indexOf(adaptor) < 0) {
            logging.warn('没有找到指定的适配器:[ ' + adaptor + ' ]', '目前只支持 [' + Adaptors.join(',') + ']')              } else {
            options.adapterMapping = [options.run, adaptor]
        }
    }
    cb()
}
