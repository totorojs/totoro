'use strict';

var _ = require('underscore')
var logging = require('../logger')

module.exports = function(cfg) {
    var browsers = cfg.browsers
    if (_.isString(browsers)) {
        cfg.browsers = browsers.split(',')
    }
}
