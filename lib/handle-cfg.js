'use strict';

var path = require('path')
var fs = require('fs')
var utilx = require('utilx')
var isExistedFile = utilx.isExistedFile

var logger = require('./logger')
var defaultCfg = {
  //runner: undefined,
  //adapter :undefined,
  //root: undefined,
  //labors: undefined,
  charset: 'utf-8',
  timeout: 5,
  host: 'server.totorojs.org',
  port: 9999
}


module.exports = handleCfg


function handleCfg(cfg, isList) {
  var globalCfg = utilx.readJSON(path.join(utilx.home, '.totoro', 'config.json'))
  var projectCfg = utilx.readJSON('totoro-config.json')
  cfg = utilx.mix(cfg, projectCfg, globalCfg, defaultCfg)

  // if cfg.list, don't need to handle options relate to test
  if (isList) return cfg

  cfg.code && handleCode(cfg)
  handleRunner(cfg)
  if (!utilx.isUrl(cfg.runner) && !isExistedFile(cfg.runner)) cfg.proxy = false
  handleAdapter(cfg)
  handleClientRoot(cfg)

  return cfg
}


function handleCode(cfg) {
  var code = cfg.code;
  var runner = 'totoro-code-runner.html'
  var script;
  if (/\.js$/.test(code)) {
    script = '<script src="' + code + '"></script>'
  } else if (/console\.log/.test(code)) {
    script = '<script>' + code + '</script>'
  } else {
    script = '<script>console.log(' + code + ')</script>'
  }

  var content = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
          '<title>Totoro Code Runner</title></head><body>' +
          script +
          '<script>totoro.end()</script>' +
          '</body></html>'

  fs.writeFileSync(runner, content, {encoding: cfg.charset})

  cfg.runner = runner
  cfg.adapter = 'no'
}


function handleClientRoot(cfg) {
  var root = cfg.root
  var runner = cfg.runner
  var adapter = cfg.adapter

  if (isExistedFile(runner)) {
    var runnerRoot = findRunnerRoot(runner, cfg.charset)
    var adapterRoot = isExistedFile(adapter) && path.dirname(adapter)
    var commonRoot = leastCommonRoot(runnerRoot, adapterRoot)

    if(root) {
      logger.debug('Specified root <', root, '>')
      root = path.resolve(root)
      if (commonRoot.indexOf(root) !== 0) {
        root = commonRoot
        logger.warn('Specified root is not appropriate, found one <', root, '>')
      }

    } else {
      root = commonRoot
      logger.debug('Not specified root, found one <', root, '>')
    }

    cfg.root = root

  } else {
    logger.debug('None of runner or adapter is file, not need root.')
    ;delete cfg.root
  }
}


function findRunnerRoot(runner, charset) {
  // --runner=/path/to/local/file?query#hash
  runner = runner.replace(/[?#].+$/, '')

  var runnerDir = path.dirname(runner)
  var runnerRoot = runnerDir
  var pathReg = /<(?:script|link)[^>]+?(?:src|href)\s*=\s*(["'])(.+?)\1/gi
  var absPathReg = /^\/|https?:\/\//i
  var content = fs.readFileSync(runner, {encoding: charset})
  var matched

  while((matched = pathReg.exec(content)) !== null) {
    var p = matched[2]
    if (!absPathReg.test(p)) {
      runnerRoot = leastCommonRoot(runnerRoot, path.dirname(path.join(runnerDir, p)))
      /*
      console.log('Current runner root.', {
        path: p,
        root: runnerRoot
      })
      */
    }
  }

  if (runnerRoot === runnerDir) {
    // logger.debug('Let runner root at least be the parent directory of runner.')
    runnerRoot = path.join(runnerRoot, '..')
  }

  logger.debug('Guess runner root <', runnerRoot, '>')
  return runnerRoot
}


function leastCommonRoot(dir1, dir2) {
  if (dir1) {
    dir1 = path.resolve(dir1)
  }
  if (dir2) {
    dir2 = path.resolve(dir2)
  }
  if (dir1 && dir2) {
    var arr1 = dir1.split(path.sep)
    var arr2 = dir2.split(path.sep)
    var commonRoot = []
    for(var i = 0; i < arr1.length; i++){
      if (arr1[i] === arr2[i]) {
        commonRoot.push(arr1[i])
      } else {
        break
      }
    }
    if (commonRoot.length) {
      // on mac, if dir1 is /usr/... and dir2 is /fool2fish/...
      // then commonRoot is [''], commonRoot.join(path.sep) is ''
      // but path.sep is expected
      return commonRoot.join(path.sep) || path.sep
    } else {
      logger.error('Cannot decide a common root for 2 directories.')
    }
  } else {
    return dir1 || dir2
  }
}


function handleRunner(cfg) {
  var runner = cfg.runner
  if (runner) {
    if (isExistedFile(runner)) {
      cfg.runner = path.resolve(runner)
    }
  } else {
    cfg.runner = findRunner()
  }
}


function findRunner() {
  var testDir
  var cwd = process.cwd()

  if (/\/tests?$/.test(cwd)) {
    testDir = cwd
  } else if (fs.existsSync('test')) {
    testDir = path.resolve('test')
  } else if (fs.existsSync('tests')) {
    testDir = path.resolve('tests')
  }

  if (testDir) {
    var runner = path.join(testDir, 'runner.html')
    var runner2 = path.join(testDir, 'index.html')
    if (isExistedFile(runner)) {
      logger.info('Found runner <', runner, '>')
      return runner
    } else if (isExistedFile(runner2)) {
      logger.info('Found runner <', runner2, '>')
      return runner2
    } else {
      logger.error('Not found runner.')
    }
  } else {
    logger.error('Not found test dir.')
  }
}


function handleAdapter(cfg) {
  if (!cfg.proxy) return

  if (cfg.adapter) {
    var runner = cfg.runner
    var adapter = cfg.adapter

    if (utilx.isKeyword(adapter)) {
      // do nothing
    } else if (utilx.isUrl(adapter)) {
      if (!utilx.isUrl(runner)) {
        // See #80
        logger.error('Runner is a file, the adapter cannot be a url.')
      }

    } else {
      if (utilx.isUrl(runner)) {
        logger.error('Runner is a url, the adapter cannot be a file.')
      }

      if (isExistedFile(adapter)) {
        cfg.adapter = path.resolve(adapter)
      } else {
        logger.error('Specified adapter <', adapter, '> dose not exist.')
      }
    }

  } else {
    findAdapter(cfg)
  }
}


function findAdapter(cfg) {
  if (!isExistedFile(cfg.runner)) return

  var runner = cfg.runner
  var adapter = path.join(path.dirname(runner), 'totoro-adapter.js')

  if (isExistedFile(adapter)) {
    logger.info('Found adapter file <', adapter, '>')
    cfg.adapter = adapter
  } else {
    logger.debug('Not found adapter file, will decide automatically.')
    return
  }
}



