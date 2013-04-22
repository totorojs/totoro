'use strict';

var fs = require('fs')
var path = require('path')
var tracer = require('tracer')
var colors = require('colors')
var dateFormat = require('dateformat')
var _ = require('underscore')

_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

var debug = process.argv.some(function(arg) {
    return arg === '-v' || arg === '--verbose'
})

var level = 'info'

if (debug) {
    level = 'debug'
}

var conf = {
    root : 'logs',
    logPathFormat : '{{root}}/{{prefix}}.{{date}}.log'
}

function LogFile(prefix, date) {

    this.date = date;
    this.prefix = prefix;
    this.path = _.template(conf.logPathFormat, {root:conf.root, prefix:prefix, date:date})
    if (!fs.existsSync(path.dirname(this.path))) {
        fs.mkdirSync(path.dirname(this.path))
    }
    this.stream = fs.createWriteStream(this.path, {
        flags: 'a',
        encoding: 'utf8'
    })
}

LogFile.prototype.write = function(str) {
    this.stream.write(str + '\n');
}

LogFile.prototype.destroy = function() {
    if (this.stream) {
        this.stream.end()
        this.stream.destroySoon()
        this.stream = null
    }
}

var _logMap = {}

function _push2File(str, title) {
    var logFile = _logMap[title], now = dateFormat(new Date(), 'yyyy.W')
    if(logFile && logFile.date !== now) {
        logFile.destroy()
        logFile = null
    }
    if(!logFile){
        logFile = _logMap[title] = new LogFile(title, now)
    }

    logFile.write(str)
}


var logger = tracer.colorConsole({
    level: level,
    format: [
        '{{message}} (in {{file}}:{{method}})', //default format
        {
            error : '{{message}} (in {{file}}:{{method}})\nCall Stack:{{stacklist}}' // error format
        }
    ],
    preprocess: function(data){
        if(data.title === 'error') {
            var callstack = '', len = data.stack.length
            for (var i = 0; i < len; i++) {
                callstack += '\n' + data.stack[i]
            }
            data.stacklist = callstack
        }

        data.title = data.title.toUpperCase()
    },
    filters: [{
        trace : colors.magenta,
        info : colors.green,
        warn : colors.yellow,
        error : [ colors.red, colors.bold ]
    }],
    transport: function(data) {
        console.log(data.output)
        _push2File(dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss  ') + data.output, data.title)
    }
})


module.exports = logger
