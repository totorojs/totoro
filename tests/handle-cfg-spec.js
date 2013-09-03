'use strict';

var fs = require('fs')
var path = require('path')
var expect = require('expect.js')
var rewire = require('rewire')
//var common = require('totoro-common')

var handleCfg = rewire('../lib/handle-cfg')

var logCache = ''
function log(msg) {
    if (typeof msg === 'undefined') {
        msg = '\n'
    }
    logCache += msg
}
handleCfg.__set__({
    logger: {
        info: log,
        debug: log,
        warn: log,
        error: log
    }
})


describe('handle-cfg', function() {

    it('handleCfg', function() {

    })

    it('_handleClientRoot', function() {
        var _handleClientRoot = handleCfg.__get__('handleClientRoot')

    })

    /*
    it('_', function() {
        var _ = handleCfg.__get__('')
    })
    */

    describe('_handleAdapter', function() {
        var _handleAdapter = handleCfg.__get__('handleAdapter')
        var testsDir = path.join(__dirname, '..', 'examples', 'simple', 'tests')
        var runnerPath = path.join(testsDir, 'runner.html')
        var adapterPath = path.join(testsDir, 'totoro-adapter.js')
        var invalidAdapterPath = path.join(testsDir, 'totoro-adapter.txt')
        var runnerUrl = 'http://aralejs.org/base/tests/runner.html'
        var adapterUrl = 'http://aralejs.org/base/tests/totoro-adapter.js'

        describe('specified adapter', function() {

            it('runner is file but adapter is url', function() {
                _handleAdapter({
                    runner: runnerPath,
                    adapter: adapterUrl
                })
                expect(logCache).to.be('Runner is file, can not specify a url adapter.')
            })

            it('runner is url but adapter is file', function() {
                _handleAdapter({
                    runner: runnerUrl,
                    adapter: adapterPath
                })
                expect(logCache).to.match(/Runner is url, can not specify a file adapter\./)
            })

            it('adapter not exist', function() {
                _handleAdapter({
                    runner: runnerPath,
                    adapter: adapterPath
                })
                expect(logCache).to.match(/Specified adapter <.+> dose not exist\./)
            })

            it('adapter is not js file', function() {
                fs.writeFileSync(invalidAdapterPath, '')
                _handleAdapter({
                    runner: runnerPath,
                    adapter: invalidAdapterPath
                })
                expect(logCache).to.match(/Specified adapter <.+> is not a js file\./)
                fs.unlinkSync(invalidAdapterPath)
            })

            it('adapter is valid', function() {
                var cfg = {
                    runner: runnerPath,
                    adapter: adapterPath
                }
                fs.writeFileSync(adapterPath, '')
                _handleAdapter(cfg)
                expect(cfg.adapter).to.be(path.resolve(adapterPath))
                fs.unlinkSync(adapterPath)
            })
        })

        it('not specified adapter', function() {
            var cfg = {runner: runnerPath}
            _handleAdapter(cfg)
            expect(logCache).to.be('Not found adapter file, will auto decide.')
        })
    })

    describe('_findAdapter', function() {
        var _findAdapter = handleCfg.__get__('findAdapter')
        var testsDir = path.join(__dirname, '..', 'examples', 'simple', 'tests')
        var runnerPath = path.join(testsDir, 'runner.html')
        var adapterPath = path.join(testsDir, 'totoro-adapter.js')

        it('with adapter file', function() {
            fs.writeFileSync(adapterPath, '')
            _findAdapter({runner: runnerPath})
            expect(logCache).to.match(/Found adapter file <.+>/)
            fs.unlinkSync(adapterPath)
        })

        it('without adapter file', function() {
            _findAdapter({runner: runnerPath})
            expect(logCache).to.be('Not found adapter file, will auto decide.')
        })
    })


    it('_relative', function() {
        var _relative = handleCfg.__get__('relative')

        var dir = path.join('path', 'to','a')
        var f = path.join('path', 'b.js')
        expect(_relative(dir, f)).to.be('../../b.js')
    })


    afterEach(function(){
        logCache = ''
    })

})
