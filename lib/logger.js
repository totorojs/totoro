'use strict';

var tracer = require('tracer')
var colorful = require('colorful')

var levels = ['debug', 'info', 'warn', 'error']
var level = process.argv.some(function(arg) {
                return arg === '--verbose'
        }) ? 'debug' : 'warn'


module.exports = tracer.colorConsole({
    methods: levels,
    level: level,

    format: [
        '{{title}} {{file}}:{{line}} | {{message}}',
        {
            error: '{{title}} {{file}}:{{line}} | {{message}}\nCall Stack:\n{{stacklist}}'
        }
    ],

    preprocess: function(data) {
        if (data.title === 'error') {
            data.stacklist = data.stack.join('\n')
        }
    },

    filters: [
        {
            info: colorful.green,
            warn: colorful.yellow,
            error: colorful.red
        }
    ],

    transport: function(data) {
        var title =data.title
        if (levels.indexOf(title) >= levels.indexOf(level)) {
            console.log(data.output)
        }
        if (title === 'error') {
            process.exit(0)
        }
    }
})
