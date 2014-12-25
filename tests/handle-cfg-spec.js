'use strict';

var fs = require('fs')
var path = require('path')
var expect = require('expect.js')
var rewire = require('rewire')
var utilx = require('utilx')
var clientHost = utilx.getExternalIpAddress()

var handleCfg = rewire('../lib/handle-cfg')

var logCache = ''
function log(msg) {
  if (arguments.length) {
    for (var i = 0; i < arguments.length; i++) {
      logCache += arguments[i]
    }
  } else {
    logCache += '\n'
  }
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
      runner: 'http://aralejs.org/base/tests/runner.html'
    }

    handleCfg(cfg)
    expect(cfg.runner).to.be('http://aralejs.org/base/tests/runner.html')
  })


  describe('_handleClientRoot', function() {
    var _handleClientRoot = handleCfg.__get__('handleClientRoot')
    var _handleRunner = handleCfg.__get__('handleRunner')

    it('runner is file', function() {
      var root = path.join(__dirname, '..', 'examples')
      var testDir = path.join(root, 'simple', 'tests')
      var runner = path.join(testDir, 'runner.html')
      var cfg = {
        runner: runner
      }
      _handleClientRoot(cfg)
      expect(cfg.root).to.be(root)
    })

    it('runner is url', function() {
      var cfg = {
        runner: 'http://aralejs.org/base/tests/runner.html'
      }
      _handleClientRoot(cfg)

      expect(cfg.root).to.be(undefined)
      expect(logCache).to.be('None of runner or adapter is file, not need root.')
    })

    it('runner is localhost url', function() {
      var cfg = {
        runner: 'http://localhost/base/tests/runner.html'
      }

      _handleRunner(cfg)
      expect(cfg.runner.indexOf(clientHost) > -1).to.be.ok()
      expect(cfg.runner).to.be('http://' + clientHost + '/base/tests/runner.html')
    })

    it('runner is localhost url', function() {
      var cfg = {
        runner: 'http://127.0.0.1/base/tests/runner.html'
      }

      _handleRunner(cfg)
      expect(cfg.runner.indexOf(clientHost) > -1).to.be.ok()
      expect(cfg.runner).to.be('http://' + clientHost + '/base/tests/runner.html')
    })
  })


  describe('_findRunnerRoot', function() {
    var _findRunnerRoot = handleCfg.__get__('findRunnerRoot')

    it('no relative link was out of project', function() {
      var root = path.join(__dirname, '..', 'examples')
      var runner = path.join(root, 'simple', 'tests', 'runner.html')
      var rt = _findRunnerRoot(runner)

      expect(rt).to.be(root)
    })

    it.skip('relative link was out of project', function() {

    })
  })


  describe('_leastCommonRoot', function() {
    var _leastCommonRoot = handleCfg.__get__('leastCommonRoot')
    var dir1 = path.join('path', 'to', 'dir1')
    var dir2 = path.join('path', 'to', 'dir2')
    var dir3 = '/usr/local/lib/node_modules/seatools/lib/tools'

    it('both dir are specified', function() {
      var rt = _leastCommonRoot(dir1, dir2)
      expect(rt).to.be(path.resolve('path', 'to'))
    })

    it('two dirs are in different disk', function() {
      var rt = _leastCommonRoot(dir1, dir3)
      expect(rt).to.be(path.sep)
    })

    it('only one dir is specified', function() {
      var rt1 = _leastCommonRoot(dir1, null)
      expect(rt1).to.be(path.resolve(dir1))

      var rt2 = _leastCommonRoot(null, dir2)
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

      expect(cfg.runner).to.be('runner.html')
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
          adapter: adapterUrl,
          proxy: true
        })

        expect(logCache).to.be('Runner is a file, the adapter cannot be a url.')
      })

      it('runner is url but adapter is file', function() {
        _handleAdapter({
          runner: runnerUrl,
          adapter: adapterPath,
          proxy: true
        })

        expect(logCache).to.match(/Runner is a url, the adapter cannot be a file\.Specified adapter <.+> dose not exist\./)
      })

      it('adapter not exist', function() {
        _handleAdapter({
          runner: runnerPath,
          adapter: adapterPath,
          proxy: true
        })

        expect(logCache).to.match(/Specified adapter <.+> dose not exist\./)
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
      var cfg = {runner: runnerPath, proxy: true}
      _handleAdapter(cfg)

      expect(logCache).to.be('Not found adapter file, will decide automatically.')
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

      expect(logCache).to.be('Not found adapter file, will decide automatically.')
    })
  })


  afterEach(function(){
    logCache = ''
  })

})
