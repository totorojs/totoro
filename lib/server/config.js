'use strict';

var utils  = require('./../utils')

var ip = utils.getExternalIpAddress()

module.exports = {
    contractor:{
        host: ip,
        httpPort: '9000',
        tcpPort: '8999'
    }
}
