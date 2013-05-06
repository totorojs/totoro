'use strict';

var logging = require('../logger')

module.exports = function(cfg) {
    var browsers = cfg.browsers
    if (typeof browsers === 'string') {
        cfg.browsers = browsers.split(',')
    }
}
