'use strict';

var path = require('path')
var fs = require('fs')
var hogan = require('hogan.js')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./../utils')


module.exports = handleRunner

function handleRunner(cfg){
    if(cfg.runner){
        cfg.runner = checkRunner(cfg.runner)
        logger.debug('specified runner "' + cfg.runner + '" .')
    }else{
        logger.debug('not specified runner, will find out runner.')
        cfg.testsDir = findTestsDir()
        logger.debug('found tests dir "' + cfg.testsDir +'"')
        cfg.runner = findRunner(cfg.testsDir)
    }
    
    if(cfg.runner){
        if(cfg.overwrite){
            logger.debug('overwrite existed runner "' + cfg.runner + '"')
            cfg.runner = createRunner(cfg.testsDir, cfg.tests, cfg.runner)
        }
    }else{
        logger.debug('not found runner, will create it.')
        cfg.autoRunner = true
        cfg.runner = createRunner(cfg.testsDir, cfg.tests)
    }
    return cfg
}

function checkRunner(runner){
    var exists = fs.existsSync(runner)
    if (exists){
        if (path.extname(runner) !== 'html'){
            logger.error('runner "' + runner + '" is not a html file.')
        }
    } else {
        logger.error('runner "' + runner + '" not exists.')
    }
    return path.resolve(runner)
}


function findRunner(testsDir){
    var runner1 = path.join(testsDir, 'runner.html')
    var runner2 = path.join(testsDir, 'index.html')
    if(fs.existsSync(runner1)){
        return runner1
    }else if(fs.existsSync(runner2)){
        return runner2
    }
}


function findTestsDir(){
    var cwd = process.cwd()
    var dir1 = path.join(cwd, 'test')
    var dir2 = path.join(cwd, 'tests')
    if(process.cwd().match(/tests?$/g)){
        return cwd
    }else if(fs.existsSync('test')){
        return dir1
    }else if(fs.existsSync('tests')){
        return dir2
    }else{
        logger.error('not found test dir.')
    }
}

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
    logger.debug('render runner "' + runner + '"')
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


function findAlias(testsDir) {
    var pkgPath = path.join(testsDir, '..', 'package.json')
    var pkgStr = fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath) : '{}'
    var pkg = JSON.parse(pkgStr)
    var alias = pkg.dependencies || {}
    alias = utils.mix(alias, require('./config').alias)
    // TODO 1.handle devDependencies 2.split alias into js alias and css alias
    return JSON.stringify(alias)
}

function renderRunner(p, info) {
    var templPath = path.join(__dirname, '..', '..', 'static', 'runner.html')
    var tmpl = hogan.compile(fs.readFileSync(templPath) + '')
    fs.writeFileSync(p, tmpl.render(info), 'utf-8')
}

