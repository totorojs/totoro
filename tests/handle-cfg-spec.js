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
        var cfg = {
            runner: 'http://aralejs.org/base/tests/runner.html',
            clientRoot: '..',
            clientHost: '127.0.0.1',
            clientPort: 9998
        }

        handleCfg(cfg)

        expect(cfg.runner).to.be('http://aralejs.org/base/tests/runner.html')
        expect(cfg.clientRoot).to.be(undefined)
        expect(cfg.clientServer).to.be(undefined)
        expect(cfg.clientPort).to.be(undefined)
    })


    describe('_handleClientRoot', function() {
        var _handleClientRoot = handleCfg.__get__('handleClientRoot')

        describe('runner is file', function() {
            var proj = path.join(__dirname, '..', 'examples', 'simple')
            var runner = path.join(proj, 'tests', 'runner.html')

            it('specified clientRoot', function() {
                var cfg = {
                    runner: runner,
                    clientRoot: path.join(proj, 'tests')
                }
                _handleClientRoot(cfg)

                expect(cfg.clientRoot).to.be(proj)
            })

            it('not specified clientRoot', function() {
                var adapter = path.join(__dirname, 'totoro-adapter.js')
                fs.writeFileSync(adapter, '')
                var cfg = {
                    runner: runner,
                    adapter: adapter
                }
                _handleClientRoot(cfg)

                expect(cfg.clientRoot).to.be(path.join(__dirname, '..'))

                fs.unlinkSync(adapter)
            })
        })

        it('runner is url', function() {
            var cfg = {
                runner: 'http://aralejs.org/base/tests/runner.html'
            }
            _handleClientRoot(cfg)

            expect(cfg.clientRoot).to.be(undefined)
            expect(logCache).to.be('None of runner or adapter is existed file, not need clientRoot.')
        })
    })


    describe('_findRunnerRoot', function() {
        var _findRunnerRoot = handleCfg.__get__('findRunnerRoot')

        it('no relative link was out of project', function() {
            var proj = path.join(__dirname, '..', 'examples', 'simple')
            var runner = path.join(proj, 'tests', 'runner.html')
            var rt = _findRunnerRoot(runner)

            expect(rt).to.be(proj)
        })

        it.skip('relative link was out of project', function() {

        })
    })


    describe('_commonRoot', function() {
        var _commonRoot = handleCfg.__get__('commonRoot')
        var dir1 = path.join('path', 'to', 'dir1')
        var dir2 = path.join('path', 'to', 'dir2')
        var dir3 = '/usr/local/lib/node_modules/seatools/lib/tools'

        it('both dir are specified', function() {
            var rt = _commonRoot(dir1, dir2)
            expect(rt).to.be(path.resolve('path', 'to'))
        })

        it('two dirs are in different disk', function() {
            var rt = _commonRoot(dir1, dir3)
            expect(rt).to.be(path.sep)
        })

        it('only one dir is specified', function() {
            var rt1 = _commonRoot(dir1, null)
            expect(rt1).to.be(path.resolve(dir1))

            var rt2 = _commonRoot(null, dir2)
            expect(rt2).to.be(path.resolve(dir2))
        })
    })


    describe('_handleRunner', function() {
        var _handleRunner = handleCfg.__get__('handleRunner')

        it('specified runner as local file', function() {
            var runner = 'runner.html'
            var cwd = process.cwd()
            process.chdir(__dirname)
            fs.writeFileSync(runner, '')
            var cfg = {runner: runner}
            _handleRunner(cfg)

            expect(cfg.runner).to.be(path.resolve(runner))

            fs.unlinkSync(runner)
            process.chdir(cwd)
        })

        it('specified runner not existed', function() {
            var cwd = process.cwd()
            process.chdir(__dirname)
            var cfg = {runner: 'runner.html'}
            _handleRunner(cfg)

            expect(logCache).to.match(/Specified runner <runner\.html> is not available\./)

            process.chdir(cwd)
        })

        it('not specified runner', function() {
            var cwd = process.cwd()
            process.chdir(__dirname)
            var cfg = {}
            _handleRunner(cfg)

            expect(cfg.runner).to.be(undefined)
            expect(logCache).to.be('Not found runner.')

            process.chdir(cwd)
        })

    })


    describe('_findRunner', function() {
        var _findRunner = handleCfg.__get__('findRunner')

        it('runner is ./runner.html', function() {
            var cwd = process.cwd()
            process.chdir(__dirname)

            var runner = 'runner.html'
            fs.writeFileSync(runner, '')
            var rt = _findRunner()

            expect(rt).to.be(path.resolve(runner))
            expect(logCache).to.match(/Found runner <.+runner\.html>/)

            fs.unlinkSync(runner)
            process.chdir(cwd)
        })

        it('runner is ./index.html', function() {
            var cwd = process.cwd()
            process.chdir(__dirname)

            var runner = 'index.html'
            fs.writeFileSync(runner, '')
            var rt = _findRunner()

            expect(rt).to.be(path.resolve(runner))
            expect(logCache).to.match(/Found runner <.+index\.html>/)

            fs.unlinkSync(runner)
            process.chdir(cwd)
        })

        it('runner is ./test/runner.html', function() {
            var cwd = process.cwd()
            var tempDir = path.join(__dirname, 'temp')
            fs.mkdirSync(tempDir)
            process.chdir(tempDir)

            fs.mkdirSync('test')
            var runner = path.join('test', 'runner.html')
            fs.writeFileSync(runner, '')
            var rt = _findRunner()

            expect(rt).to.be(path.resolve(runner))
            expect(logCache).to.match(/Found runner <.+runner\.html>/)

            fs.unlinkSync(runner)
            fs.rmdirSync('test')
            process.chdir(cwd)
            fs.rmdirSync(tempDir)
        })

        it('runner is ./tests/index.html', function() {
            var cwd = process.cwd()
            var tempDir = path.join(__dirname, 'temp')
            fs.mkdirSync(tempDir)
            process.chdir(tempDir)

            fs.mkdirSync('tests')
            var runner = path.join('tests', 'index.html')
            fs.writeFileSync(runner, '')
            var rt = _findRunner()

            expect(rt).to.be(path.resolve(runner))
            expect(logCache).to.match(/Found runner <.+index\.html>/)

            fs.unlinkSync(runner)
            fs.rmdirSync('tests')
            process.chdir(cwd)
            fs.rmdirSync(tempDir)
        })

        it('not found test dir', function() {
            var cwd = process.cwd()
            var tempDir = path.join(__dirname, 'temp')
            fs.mkdirSync(tempDir)
            process.chdir(tempDir)

            var rt = _findRunner()

            expect(rt).to.be(undefined)
            expect(logCache).to.be('Not found test dir.')

            process.chdir(cwd)
            fs.rmdirSync(tempDir)
        })

        it('not found runner', function() {
            var cwd = process.cwd()
            process.chdir(__dirname)

            var rt = _findRunner()

            expect(rt).to.be(undefined)
            expect(logCache).to.be('Not found runner.')

            process.chdir(cwd)
        })
    })


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
