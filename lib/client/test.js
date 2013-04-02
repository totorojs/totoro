'use strict';

var express  = require('express')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')

var logger = require('./logger')
var utils = require('./utils')
var handleRunner = require('./handle-runner')


module.exports = Test


function Test(cfg){
    var self = this
    if(!(self instanceof Test)){
        return new Test(cfg)
    }
    cfg = utils.mix(cfg, require('./config').test)
    cfg = handleRunner(cfg)
    if(!cfg.clientRoot){
        cfg.clientRoot = guessRoot(cfg.testsDir)
    }
    self.cfg = cfg
    self.launchServer()
}


Test.prototype.launchServer = function(){
    var self = this
    var cfg = self.cfg
    var cwd = process.cwd()
    var root = path.resolve(cfg.clientRoot)
    var runner = path.relative(root, cfg.runner)
    
    process.chdir(root)
    var app = cfg.app = express()
    app.get('/totoro', function(req, res){
        res.send('totoro msg')
    })
    app.get(runner, function(req, res){
        var rawContent = fs.readFileSync(runner)
        var content = adaptReporter(rawContent, cfg.adapter)
        res.send(content)
    })
    app.use(express.static(root))
    app.listen(cfg.clientPort, cfg.clientHost, function(){
        logger.debug('start local server "' + cfg.clientHost + ':' + cfg.clientPort+ '"')
        process.chdir(cwd)
    })
}


Test.prototype.start = function(){
    
}

Test.prototype.end = function(){

}


Test.prototype.getAvilableBrowsers = function(){

}


function guessRoot(testsDir){
    // TODO
    var root = path.join(testsDir, '../')
    logger.debug('guess root is "' + root + '"')
    return root
}


Test({
    //runner:'tests/arunner.html',
    //tests:['tests/example-spec.js', 'tests/haha.js'],
    overwrite: true
})


