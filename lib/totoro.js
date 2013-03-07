var logging = require('winston')
var path = require('path')
var fs = require('fs')
var thrillRunner = require('thrill').runner

var createRunner = require('./create-runner')

var cfg = {
    autoAdapt : false,
    stream : true,
    verbose : true,
    host : "10.15.52.87:9200"
}


module.exports = main


function main() {

    var dir = process.cwd()
    var testDir = findTestDir(dir)
    var runner = findRunner(testDir)
    if (!runner) {
        runner = createRunner(testDir)
    }

    cfg.serve = dir
    cfg.run = runner

    thrillRunner(cfg, function(passed) {
        if ( passed instanceof Error) {
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
function findRunner(testDir) {
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


main()

