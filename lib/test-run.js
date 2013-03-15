'use strict';

var logging = require('winston')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')
var thrillRunner = require('thrill').runner

var env = require('./utils/env')
var createRunner = require('./create-runner')

var queenHost = '10.15.52.87:9200'

var cfg = {
    autoAdapt : false,
    stream : true,
    verbose : true,
    host : queenHost
}


module.exports = main


function main(commander) {

    if (commander.browsers) {
        getBrowsers();
        return;
    }

    var dir = process.cwd()
    var testDir = findTestDir(dir)

    var runner = findRunner(commander.run, testDir)
    if (!runner || commander.force) {
        runner = createRunner(testDir)
    }

    cfg.serve = path.join(testDir, '..')
    cfg.run = runner

    thrillRunner(cfg, function(passed) {
        if (passed instanceof Error) {
            throw passed
        }
        if (passed) {
            process.exit(0)
        } else {
            process.exit(1)
        }
    })
}


// 查找测试目录
function findTestDir(dir) {
    var names = ['test', 'tests']
    var baseName = path.basename(dir)
    for (var i = 0; i < names.length; i++) {
        if (baseName === names[i]) {
            return dir
        }
    }
    for (var i = 0; i < names.length; i++) {
        var testDir = path.join(dir, names[i])
        if (fs.existsSync(testDir)) {
            logging.debug('found test dir: ' + names[i])
            return testDir
        }
    }
    logging.error('not found test dir')
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
        var runner = path.join(testDir, names[i])
        if (fs.existsSync(runner)) {
            logging.debug('found runner: ' + runner)
            return runner
        }
    }
    logging.debug('not found runner')
}


function getBrowsers() {
    require('queen-remote').client({
        callback: function(queen) {

            if (queen.workerProviders.length < 1) {
                logging.info('Not found valid browsers!')
            } else {
                _.sortBy(queen.workerProviders, function(str) {
                    return str.toString()
                }).forEach(function(provider) {
                    logging.info(provider)
                })
            }

            process.exit(0)
        },
        host: queenHost
    })
}

//main()

