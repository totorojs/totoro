'use strict';

var tracer = require('tracer')
var colorful = require('colorful')

var levels = ['debug', 'info', 'warn', 'error']
var logLevel = 'info'

process.argv.forEach(function(item, idx, list) {
  if (item.match(/^(--debug|-[a-zA-Z]*d[a-zA-Z]*)$/)) {
    logLevel = 'debug'
  }
});

module.exports = tracer.colorConsole({
    methods: levels,
    level: logLevel,

    format: ['{{title}} {{file}}:{{line}} | {{message}}', {
        error: '{{title}} {{file}}:{{line}} | {{message}}\nCall Stack:\n{{stacklist}}'
    }],

    preprocess: function(data) {
        if (data.title === 'error') {
            data.stacklist = data.stack.join('\n')
        }
    },

    filters: [{
        info: colorful.gray,
        warn: colorful.yellow,
        error: colorful.red
    }],

    transport: function(data) {
        var title = data.title
        if (levels.indexOf(title) >= levels.indexOf(logLevel)) {
            console.log(data.output)
        }
        if (title === 'error') {
            process.exit(1)
        }
    }
})
