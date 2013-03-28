'use strict';

var path = require('path')
var logging = require('winston')
var fs = require('fs')
var env = require('../utils/env')
var createRunner = require('../create-runner')

module.exports = function(commander, options, cb) {
    var testDir = options.testDir = findTestDir()
    var run = options.run = findRunner(commander.run, testDir)

    if (!run || commander.force) {
        var existsRunner = options.newRunner = !createRunner.existsRunner(testDir)
        options.run = createRunner(testDir, existsRunner || commander.force)
    }
    cb()
}

// 查找 runner
function findRunner(runner, testDir) {

    if (runner) {
        if (env.isAbsolute(runner)) {
            return runner
        } else {
            return path.join(process.cwd(), runner)
        }
    }

    var names = ['runner.html', 'index.html']
    for (var i = 0; i < names.length; i++) {
        runner = path.join(testDir, names[i])
        if (fs.existsSync(runner)) {
            logging.debug('found runner: ' + runner)
            return runner
        }
    }
    logging.debug('not found runner')
}


// 查找测试目录
function findTestDir() {
    var dir = process.cwd()
    var names = ['test', 'tests']
    var baseName = path.basename(dir)

    for (var i = 0; i < names.length; i++) {
        if (baseName === names[i]) {
            return dir
        }
    }
    for (var j = 0; j < names.length; j++) {
        var testDir = path.join(dir, names[j])
        if (fs.existsSync(testDir)) {
            logging.debug('found test dir: ' + names[j])
            return testDir
        }
    }
    logging.error('not found test dir')
}
