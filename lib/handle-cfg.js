'use strict';

var path = require('path')
var fs = require('fs')
var common = require('totoro-common')
var isExistedFile = common.isExistedFile

var logger = require('./logger')
var defaultCfg = {
    //runner: undefined,
    //adapter :undefined,
    //root: undefined,
    //browsers: undefined,
    charset: 'utf-8',
    timeout: 5,
    clientHost: common.getExternalIpAddress(),
    clientPort: 9998,
    host: 'server.totorojs.org',
    port: 9999
}


module.exports = handleCfg


function handleCfg(cfg, isList) {
    var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
    var globalCfg = common.readCfgFile(path.join(home, '.totoro', 'config.json'))
    var projectCfg = common.readCfgFile('totoro-config.json')
    cfg = common.mix(cfg, projectCfg, globalCfg, defaultCfg)

    // if cfg.list, don't need to handle options relate to test
    if (isList) return cfg

    handleCode(cfg)
    handleRunner(cfg)
    handleAdapter(cfg)
    handleClientRoot(cfg)

    return cfg
}


function handleCode(cfg) {
    if (!cfg.code) return;
    var code = cfg.code;
    var runner = 'totoro-code-runner.html'
    var script;
    if (/\.js$/.test(code)) {
        script = '<script src="' + code + '"></script>'
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
        var runnerRoot = findRunnerRoot(runner)
        var adapterRoot = isExistedFile(adapter) && path.dirname(adapter)
        var commonRoot = leastCommonRoot(runnerRoot, adapterRoot)

        if(root) {
            logger.debug('Specified root <' + root + '>')
            root = path.resolve(root)
            if (commonRoot.indexOf(root) !== 0) {
                root = commonRoot
                logger.warn('Specified root is not appropriate, found one <' + root + '>')
            }

        } else {
            root = commonRoot
            logger.debug('Not specified root, found one <' + root + '>')
        }

        cfg.runner = relative(root, runner)
        if (isExistedFile(adapter)) {
            cfg.adapter = relative(root, adapter)
        }
        cfg.root = root
    } else {
        logger.debug('None of runner or adapter is existed file, not need root.')
        ;delete cfg.root
        ;delete cfg.clientHost
        ;delete cfg.clientPort
    }
}


function findRunnerRoot(runner) {
    // TODO
    var runnerRoot = path.join(runner, '..', '..')
    logger.debug('Found runner root <' + runnerRoot + '>')
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
            logger.error('Cannot decide a common root for runner and adapter.')
        }
    } else {
        return dir1 || dir2
    }
}


function handleRunner(cfg) {
    if (cfg.runner) {
        var runner = cfg.runner
        if (!common.isUrl(runner)) {
            if (isExistedFile(runner)) {
                cfg.runner = path.resolve(runner)
            } else {
                logger.error('Specified runner <' + runner + '> is not available.')
            }
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
            logger.info('Found runner <' + runner + '>')
            return runner
        } else if (isExistedFile(runner2)) {
            logger.info('Found runner <' + runner2 + '>')
            return runner2
        } else {
            logger.error('Not found runner.')
        }
    } else {
        logger.error('Not found test dir.')
    }
}


function handleAdapter(cfg) {
    if (cfg.adapter) {
        var runner = cfg.runner
        var adapter = cfg.adapter

        /*
         * NOTE
         * if runner is url, adapter must not be local file
         * if runner is local file, adapter must not be url
         * see #80
         */
        if (common.isKeyword(adapter)) {
            // do nothing
        } else if (common.isUrl(adapter)) {
            if (!common.isUrl(runner)) {
                logger.error('Runner is file, can not specify a url adapter.')
            }

        } else {
            if (common.isUrl(runner)) {
                logger.error('Runner is url, can not specify a file adapter.')
            }

            if (isExistedFile(adapter)) {
                if (path.extname(adapter) === '.js') {
                    cfg.adapter = path.resolve(adapter)
                } else {
                    logger.error('Specified adapter <' + adapter + '> is not a js file.')
                }
            } else {
                logger.error('Specified adapter <' + adapter + '> dose not exist.')
            }
        }

    } else {
        cfg.adapter = findAdapter(cfg)
    }
}


function findAdapter(cfg) {
    var runner = cfg.runner
    var adapter = path.join(path.dirname(runner), 'totoro-adapter.js')

    if (isExistedFile(adapter)) {
        logger.info('Found adapter file <' + adapter + '>')
        return adapter
    } else {
        logger.debug('Not found adapter file, will auto decide.')
        return
    }
}


function relative(from, to) {
    return path.relative(from, to).replace(path.sep, '/')
}



