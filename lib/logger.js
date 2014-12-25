'use strict';

var tracer = require('tracer')
var colorful = require('colorful')

var methods = ['debug', 'info', 'warn', 'error']
var level = 'info'

var logger = tracer.colorConsole({
  inspectOpt: {depth: null},
  methods: methods,
  level: 'debug',

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

logger.setLevel = function(l) {
  if (methods.indexOf(l) === -1) return
  level = l
}

module.exports = logger