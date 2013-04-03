'use strict';

var winston = require('winston')

winston.addColors({
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red'
})

var logger = new winston.Logger({
    transports : [
        new (winston.transports.Console)({
            level: 'debug',
            colorize: true
        })
    ],
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    }
})

logger.on('logging', function (transport, level, msg, meta) {
    if(level === 'error'){
        console.log('an error occured, program is shutting down ...')
        process.exit(1)
    }
});

module.exports = logger
