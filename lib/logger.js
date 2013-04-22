'use strict';

var tracer = require('tracer')
var colors = require('colors');


var debug = process.argv.some(function(arg) {
    return arg === '-v' || arg === '--verbose'
})

var level = 'info'

if (debug) {
    level = 'debug'
}

// TODO 记录每天测试次数
var testRecord = function(str, data) {
    return str
}
var logger = tracer.colorConsole({
    level: level,
    format: [
        '{{message}} (in {{file}}:{{method}})', //default format
        {
            error : '{{message}} (in {{file}}:{{method}})\nCall Stack:{{stacklist}}' // error format
        }
    ],
    preprocess :  function(data){
        if(data.title === 'error') {
            var callstack = '', len = data.stack.length
            for (var i = 0; i < len; i++) {
                callstack += '\n' + data.stack[i]
            }
            data.stacklist = callstack
        }

        data.title = data.title.toUpperCase()
    },
    filters: [testRecord, {
        trace : colors.magenta,
        info : colors.green,
        warn : colors.yellow,
        error : [ colors.red, colors.bold ]
    }]
})

module.exports = logger
