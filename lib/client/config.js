'use strict';

var utils  = require('./utils')

var ip = utils.getExternalIpAddress()

module.exports = {
    test:{
        //tests: undefined,
        //runner: undefined,
        //adapter:undefined,
        //override: false,
        //reporter: undefined,
        //platforms: undefined,
        //runInIframe: false,
        //clientRoot: undefined,
        clientHost: ip,
        clientPort: '8888',
        serverHost: ip,
        serverPort: '9000'
    },
    alias: {
        $: 'gallery/jquery/1.7.2/jquery',
        jquery: 'gallery/jquery/1.7.2/jquery',
        expect: 'gallery/expect/0.2.0/expect',
        sinon: 'gallery/sinon/1.6.0/sinon',
        'event-simulate': 'arale/event-simulate/1.0.0/event-simulate'
    },
    avilableTestSuites:['mocha']
}
