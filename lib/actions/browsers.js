'use strict';

var _ = require('underscore')
var logging = require('../logger')

module.exports = function(cfg) {
    var platforms = cfg.platforms
    if (_.isString(platforms)) {
        cfg.platforms = platforms.split(',')
    }
}
