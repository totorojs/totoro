'use strict';

var fs = require('fs')
var path = require('path')
var colorful = require('colorful')
var utilx = require('utilx')

var globalCfgPath = path.join(utilx.home, '.totoro', 'config.json')


module.exports = function(cfg) {
  var globalCfg = utilx.readJSON(globalCfgPath)
  var keys = Object.keys(cfg || {})

  if (keys.length) {
    keys.forEach(function(key) {
      var value = cfg[key]
      if (value === '') {
        delete globalCfg[key]
      } else {
        globalCfg[key] = value
      }
    })
    utilx.writeJSON(globalCfgPath, globalCfg)

  } else {
    list(globalCfg)
  }
}


function list(cfg) {
  if (Object.keys(cfg).length) {
    console.log()
    Object.keys(cfg).forEach(function(key) {
      console.log('  ' + utilx.unCamelcase(key) + '=' + cfg[key])
    })
    console.log()
  } else {
    console.log('\n  No global configuration.\n')
  }
}

