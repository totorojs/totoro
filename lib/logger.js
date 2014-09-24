'use strict';

var tracer = require('tracer')
var colorful = require('colorful')

var methods = ['debug', 'info', 'warn', 'error']
var level = 'info'
process.argv.forEach(function(item, idx, list) {
  if (item.match(/^(--debug|-[a-zA-Z]*d[a-zA-Z]*)$/)) {
    level = 'debug'
  }
})

module.exports = tracer.colorConsole({
  inspectOpt: {depth: null},
  methods: methods,
  level: level,

  format: '{{title}} {{file}}:{{line}} | {{message}}',

  filters: {
    info: colorful.gray,
    warn: colorful.yellow,
    error: colorful.red
  },

  transport: function(data) {
    var title = data.title;
    if (methods.indexOf(title) >= methods.indexOf(level)) {
      console.log(data.output)
      if (title === 'error') {
        throw new Error(data.message)
      }
    }
  }
})