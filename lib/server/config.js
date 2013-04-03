'use strict';

var utils  = require('./../utils')

var ip = utils.getExternalIpAddress()

module.exports = {
    contractor:{
        serverHost: ip,
        serverPort: '9000'
    }
}
