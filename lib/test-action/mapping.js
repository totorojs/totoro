'use strict';

module.exports = function(commander, options, cb) {
    var mapping = commander.mapping;
    if (mapping && mapping.indexOf(',') > 0) {
        options.adaptMapping = mapping.split(',') 
    }
    cb()
}
