'use strict';

var path = require('path')
var fs = require('fs')
var common = require('totoro-common')
var logger = common.logger
var isExistedFile = common.isExistedFile

var defaultCfg = {
    //runner: undefined,
    //adapter:undefined,
    //clientRoot: undefined,
    browsers: ['chrome', 'firefox', 'safari', 'ie/9', 'ie/8', 'ie/7', 'ie/6'],
    charset: 'utf-8',
    timeout: 5,
    clientHost: common.getExternalIpAddress(),
    clientPort: 9998,
    serverHost: '10.15.52.87',
    serverPort: 9999
}

module.exports = handleCfg

function handleCfg(cfg) {
    var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
    var globalCfg = common.readCfgFile(path.join(home, '.totoro', 'config.json'))
    var projectCfg = common.readCfgFile('totoro-config.json')
    cfg = common.mix(cfg, projectCfg, globalCfg, defaultCfg)

    // if cfg.list, don't need to handle options relate to test
    if(!cfg.list){
        /*
         * need to find out runner first
         * because handleClientRoot() need to know runner and adapter to decide
         *     if a clientRoot is required and where it is
         * then runner and adapter may change from local dir path to url according to clientRoot
         */
        if (!cfg.runner) {
            logger.debug('not specified runner, try to find out')
            cfg.runner = findRunner()
        }
        handleClientRoot(cfg)
        handleRunner(cfg)
        handleAdapter(cfg)
    }

    return cfg
}


function handleClientRoot(cfg) {
    var clientRoot = cfg.clientRoot
    var runner = cfg.runner
    var adapter = cfg.adapter
    var runnerIsExistedFile = isExistedFile(runner)
    var adapterIsExistedFile = isExistedFile(adapter)
    /*
     * no need to consider other conditions about runner and adapter
     * just see if a clientRoot is required
     */
    if (runnerIsExistedFile || adapterIsExistedFile) {
        var runnerRoot = runnerIsExistedFile && guessRunnerRoot(runner)
        var adapterRoot = adapterIsExistedFile && path.dirname(adapter)
        var root = commonRoot(runnerRoot, adapterRoot)

        if(clientRoot) {
            logger.debug('specified clientRoot: ' + clientRoot)
            clientRoot = path.resolve(clientRoot)
            if (root.indexOf(clientRoot) !== 0) {
                clientRoot = root
                logger.warn('specified clientRoot is not appropriate, guessed one: ' + clientRoot)
            }
        } else {
            clientRoot = root
            logger.debug('not specified clientRoot, guessed one: ' + clientRoot)
        }

        cfg.clientRoot = clientRoot
    } else {
        logger.debug('none of runner and adapter is existed file, not need clientRoot')
        ;delete cfg.clientRoot
    }
}

function guessRunnerRoot(runner) {
    // TODO
    var root = path.join(runner, '..', '..')
    logger.debug('guess runner root is: ' + root)
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
            return root.join(path.sep)
        } else {
            logger.error('cannot decide a root for runner and adapter')
        }
    } else {
        return dir1 || dir2
    }
}

function findRunner() {
    var testDir
    var cwd = process.cwd()

    if (/^tests?$/.test(cwd)) {
        testDir = cwd
    } else if (fs.existsSync('test')) {
        testDir = path.resolve('test')
    } else if (fs.existsSync('tests')) {
        testDir = path.resolve('tests')
    }

    if (testDir) {
        var runner = path.join(testDir, 'runner.html')
        if (isExistedFile(runner)) {
            logger.debug('found runner: ' + runner)
            return runner
        } else {
            logger.error('not found runner')
        }
    } else {
        logger.error('not found test dir')
    }
}

function handleRunner(cfg) {
    var runner = cfg.runner
    if (!common.isUrl(runner)) {
        if (isExistedFile(runner)) {
            if (!path.extname(runner) === '.html') {
                logger.error('runner: ' + runner + ' is not a html file')
            }
        } else {
            logger.error('specified runner: ' + runner + ' is not available')
        }
    }
}

function handleAdapter(cfg) {
    var adapter = cfg.adapter
    if (adapter && !common.isUrl(adapter) && !common.isKeyword(adapter)) {
        if (isExistedFile(adapter)) {
            if (!path.extname(adapter) === '.js') {
                logger.error('adapter: ' + adapter + ' is not a js file')
            }
        } else {
            logger.error('specified adapter: ' + adapter + ' is not available')
        }
    }
}
