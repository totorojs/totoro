'use strict';

var path = require('path')
var fs = require('fs')
var logger = require('totoro-log')

var defaultCfg = {
    //runner: undefined,
    //adapter:undefined,
    //clientRoot: undefined,
    browsers: ['chrome', 'firefox', 'safari', 'ie/9', 'ie/8', 'ie/7', 'ie/6'],
    charset: 'utf-8',
    timeout: 5,
    clientHost: getExternalIpAddress(),
    clientPort: 9998,
    serverHost: '10.15.52.87',
    serverPort: 9999
}

module.exports = handleCfg

function handleCfg(cfg) {
    var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
    var globalCfg = readCfgFile(path.join(home, '.totoro', 'config.json'))
    var projectCfg = readCfgFile('totoro-config.json')
    cfg = mix(cfg, projectCfg, globalCfg, defaultCfg)

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

function readCfgFile(p) {
    try {
        return require(path.resolve(p))
    } catch(e) {
        logger.debug('fail to read config file: ' + p)
        return
    }
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
        var runnerRoot
        var adapterRoot
        if (runnerIsExistedFile) {
            runnerRoot = guessRunnerRoot(runner)
        }
        if (adapterIsExistedFile) {
            adapterRoot = path.dirname(adapter)
        }
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
    if (!isUrl(runner)) {
        if (isExistedFile(runner)) {
            if (path.extname(runner) === '.html') {
                cfg.runner = dir2Url(runner, cfg)
            } else {
                logger.error('runner: ' + runner + ' is not a html file')
            }
        } else {
            logger.error('specified runner: ' + runner + ' is not available')
        }
    }
}

function handleAdapter(cfg) {
    var adapter = cfg.adapter
    if (adapter && !isUrl(adapter) && !isKeyword(adapter)) {
        if (isExistedFile(adapter)) {
            if (path.extname(adapter) === '.js') {
                cfg.adapter = dir2Url(adapter, cfg)
            } else {
                logger.error('adapter: ' + adapter + ' is not a js file')
            }
        } else {
            logger.error('specified adapter: ' + adapter + ' is not available')
        }
    }
}


function isUrl(p) {
    /* jshint -W092 */
    return /^https?:\/\//.test(p)
}

function isKeyword(p) {
    return p.indexOf('.') === -1 && p.indexOf(path.sep) === -1
}

function isExistedFile(p){
    return p && fs.existsSync(p) && fs.statSync(p).isFile()
}

function dir2Url(p, cfg){
    return 'http://' + cfg.clientHost + ':' + cfg.clientPort +
            '/' + path.relative(cfg.clientRoot, p).replace(path.sep, '/')
}

function mix(target, src, ow) {
    target = target || {}
    var len = arguments.length
    var srcEnd = len - 1
    var lastArg = arguments[len - 1]

    if ( typeof lastArg === 'boolean' || typeof lastArg === 'number') {
        ow = lastArg
        srcEnd--
    } else {
        ow = false
    }

    for (var i = 1; i <= srcEnd; i++) {
        var current = arguments[i] || {}
        for (var j in current) {
            if (ow || typeof target[j] === 'undefined') {
                target[j] = current[j]
            }
        }
    }

    return target
}

function getExternalIpAddress() {
    var interfaces = require('os').networkInterfaces()
    var addresses = []
    Object.keys(interfaces).forEach(function(name) {
        var iface = interfaces[name]
        for (var i in iface) {
            var node = iface[i]
            if (node.family === 'IPv4' && node.internal === false) {
                addresses = addresses.concat(node)
            }
        }
    })
    if (addresses.length > 0) {
        return addresses[0].address
    }
}
