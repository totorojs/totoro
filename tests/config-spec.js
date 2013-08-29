'use strict';

var path = require('path')
var expect = require('expect.js')
var shelljs = require('shelljs')
var rewire = require('rewire')
var common = require('totoro-common')

var config = rewire('../lib/config')

var globalCfgPath = path.join(common.home, '.totoro', 'config.json')
var globalCfg = common.readCfgFile(globalCfgPath)

var logCache = ''
config.__set__({
    console: {
        log: function (msg) {
            if (typeof msg === 'undefined') {
                msg = '\n'
            }
            logCache += msg
        }
    }
})


describe('config', function() {

    it('list config', function() {
        common.writeCfgFile(globalCfgPath, {
            serverHost: '127.0.0.1'
        })
        config()
        expect(logCache).to.be('\n  server-host=127.0.0.1\n')

    })

    it('list empty config', function() {
        common.writeCfgFile(globalCfgPath, {})
        config()
        expect(logCache).to.be('\n  No global configuration.\n')
    })

    it('modify config', function() {
        common.writeCfgFile(globalCfgPath, {
            serverHost: '127.0.0.1'
        })
        config({serverHost: '0.0.0.0'})
        config()
        expect(logCache).to.be('\n  server-host=0.0.0.0\n')
    })

    it('delete config', function() {
        common.writeCfgFile(globalCfgPath, {
            serverHost: '127.0.0.1'
        })
        config({serverHost: ''})
        config()
        expect(logCache).to.be('\n  No global configuration.\n')
    })

    afterEach(function(){
        logCache = ''
    })

    after(function(){
        common.writeCfgFile(globalCfgPath, globalCfg)
    })

})
