'use strict';

var express  = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./utils')
var createRunner = require('./create-runner')

var defaultCfg = {
    //tests: undefined,
    //runner: undefined,
    //override: false,
    //reporter: undefined,
    //platforms: undefined,
    //runInIframe: false,
    //clientRoot: undefined,
    //clientTcp: 'localhost:8887',
    clientHttp: 'localhost:8888',
    //serverTcp: 'localhost:8889',
    serverHttp: 'localhost:9000'
}


module.exports = Test


function Test(cfg){
    var self = this
    if(!(self instanceof Test)){
        return new Test(cfg)
    }
    
    cfg = utils.mix(cfg, defaultCfg)
    
    // handle runner
    if(cfg.runner){
        checkRunner(cfg.runner)
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
    
    
    if(!cfg.clientRoot){
        cfg.clientRoot = guessRoot(cfg.testsDir)
    }
    
    self.cfg = cfg
    
    return
    self.launchServer()
    self.start()
    
    return
    var app = launchServer(cfg.root)
    var ip = utils.getExternalIpAddress()

}


Test.prototype.launchServer = function(){
    var self = this
    var root = self.cfg.clientRoot
    var cwd = process.cwd()
    
    root = path.join(cwd, root)
    
    process.chdir(root)
    var app = express()
    app.use(express.static(root))
    app.listen(9999)

    process.chdir(cwd)
    return app
}


Test.prototype.run = function(){
    
}


Test.prototype.getAvilableBrowsers = function(){

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
    if(process.cwd().match(/tests?$/g)){
        return './'
    }else if(fs.existsSync('test')){
        return 'test'
    }else if(fs.existsSync('tests')){
        return 'tests'
    }else{
        logger.error('not found test dir.')
    }
}


function guessRoot(){}


Test({
    //runner:'tests/arunner.html',
    //tests:['tests/example-spec.js', 'tests/haha.js'],
    overwrite: true
})


