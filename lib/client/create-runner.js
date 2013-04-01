'use strict';

var path = require('path')
var fs = require('fs')
var hogan = require('hogan.js')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./utils')


module.exports = createRunner


function createRunner(testsDir, tests, runner){
    runner = runner || path.join(testsDir, 'runner.html')
    if(tests){
        logger.debug('specified tests.')
        if (typeof tests === 'string'){
            tests = [tests]
        }
        var rawTests = tests
        tests = []
        rawTests.forEach(function(file, idx, list){
            if(fs.existsSync(file)){
                tests.push(file)
            }else{
                logger.warn('test script "' + file + '" not exists.')
            }
        })
        if(!tests.length){
            logger.error('all specified are invalid tests.')
        }
    }else{
        logger.debug('search test scripts in dir "' + testsDir + '"')
        tests =  findTests(testsDir)
    }
    var testStyle = findTestStyle(tests)
    var useDeps = JSON.stringify(tests.map(function(f) {
        return './' + path.relative(testsDir, f)
    }))
    var alias = findAlias(testsDir)
    var info = {
        testStyle: testStyle,
        alias: alias,
        useDeps: useDeps
    }
    renderRunner(runner, info)
    logger.debug('render runner "' + path.relative(process.cwd(), runner) + '"')
    return runner
}


function findTests(testsDir){
    var tests = utils.findFiles(testsDir, /^.*(test|spec).*\.js$/i)
    if(tests.length === 0){
        logger.error('not found tests in "' + testsDir + '"')
    }
    return tests
}


function findTestStyle(tests){
    // TODO
    return 'bdd'
}

var defaultAlias = {
    $: 'gallery/jquery/1.7.2/jquery',
    jquery: 'gallery/jquery/1.7.2/jquery',
    expect: 'gallery/expect/0.2.0/expect',
    sinon: 'gallery/sinon/1.6.0/sinon',
    'event-simulate': 'arale/event-simulate/1.0.0/event-simulate'
}

function findAlias(testsDir) {
    var pkgPath = path.join(testsDir, '..', 'package.json')
    var pkgStr = fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath) : '{}'
    var pkg = JSON.parse(pkgStr)
    var alias = pkg.dependencies || {}
    alias = utils.mix(alias, defaultAlias)
    // TODO 1.handle devDependencies 2.split alias into js alias and css alias
    return JSON.stringify(alias)
}

function renderRunner(p, info) {
    var templPath = path.join(path.dirname(module.filename), '../../static/runner.html')
    var tmpl = hogan.compile(fs.readFileSync(templPath) + '')
    fs.writeFileSync(p, tmpl.render(info), 'utf-8')
}

