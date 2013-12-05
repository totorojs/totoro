'use strict';

var path = require('path')
var fs = require('fs')
var common = require('totoro-common')
var isExistedFile = common.isExistedFile

var logger = require('./logger')
var defaultCfg = {
    //runner: undefined,
    //adapter :undefined,
    //clientRoot: undefined,
    //browsers: undefined,
    charset: 'utf-8',
    timeout: 5,
    clientHost: common.getExternalIpAddress(),
    clientPort: 9998,
    serverHost: 'server.totorojs.org',
    serverPort: 9999
}


module.exports = handleCfg


function handleCfg(cfg, isList) {
    var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
    var globalCfg = common.readCfgFile(path.join(home, '.totoro', 'config.json'))
    var projectCfg = common.readCfgFile('totoro-config.json')
    cfg = common.mix(cfg, projectCfg, globalCfg, defaultCfg)

    // if cfg.list, don't need to handle options relate to test
    if (isList) return cfg

    handleRunner(cfg)
    handleAdapter(cfg)
    handleClientRoot(cfg)
    return cfg
}


function handleClientRoot(cfg) {
    var clientRoot = cfg.clientRoot
    var runner = cfg.runner
    var adapter = cfg.adapter

    if (isExistedFile(runner)) {
        var runnerRoot = findRunnerRoot(runner)
        var adapterRoot = isExistedFile(adapter) && path.dirname(adapter)
        var root = commonRoot(runnerRoot, adapterRoot)

        if(clientRoot) {
            logger.debug('Specified clientRoot <' + clientRoot + '>')
            clientRoot = path.resolve(clientRoot)
            if (root.indexOf(clientRoot) !== 0) {
                clientRoot = root
                logger.warn('Specified clientRoot is not appropriate, found one <' + clientRoot + '>')
            }

        } else {
            clientRoot = root
            logger.debug('Not specified clientRoot, found one <' + clientRoot + '>')
        }

        cfg.runner = relative(clientRoot, runner)
        if (isExistedFile(adapter)) {
            cfg.adapter = relative(clientRoot, adapter)
        }
        cfg.clientRoot = clientRoot
    } else {
        logger.debug('None of runner or adapter is existed file, not need clientRoot.')
        ;delete cfg.clientRoot
        ;delete cfg.clientHost
        ;delete cfg.clientPort
    }
}


function findRunnerRoot(runner) {
    // TODO
    var root = path.join(runner, '..', '..')
    logger.debug('Found runner root <' + root + '>')
    return root
}


function commonRoot(dir1, dir2) {
    if (dir1) {
        dir1 = path.resolve(dir1)
    }
    if (dir2) {
        dir2 = path.resolve(dir2)
    }
    if (dir1 && dir2) {
        var arr1 = dir1.split(path.sep)
        var arr2 = dir2.split(path.sep)
        var root = []
        for(var i = 0; i < arr1.length; i++){
            if (arr1[i] === arr2[i]) {
                root.push(arr1[i])
            } else {
                break
            }
        }
        if (root.length) {
            // on mac, if dir1 is /usr/... and dir2 is /fool2fish/...
            // then root is [''], root.join(path.sep) is ''
            // but path.sep is expected
            return root.join(path.sep) || path.sep
        } else {
            logger.error('Cannot decide a root for runner and adapter.')
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



