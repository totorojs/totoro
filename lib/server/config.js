'use strict';

var utils  = require('./../utils')

var ip = utils.getExternalIpAddress()

module.exports = {
    pool:{
        serverHost: ip,
        serverPort: '9000'
    }
}
