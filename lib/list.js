'use strict';

var http = require('http')
var colorful = require('colorful')
var utilx = require('utilx')

var logger = require('./logger')
var handleCfg = require('./handle-cfg')


module.exports = function(cfg) {
  cfg = handleCfg(cfg, true)

  var listUrl = 'http://' + cfg.host + ':' + cfg.port + '/__list'
  http.get(listUrl, function(res) {
    var data = ''

    res.on('data', function(chunk) {
      data += chunk
    })

    res.on('end', function() {
      var labors = JSON.parse(data)
      if(Object.keys(labors).length) {
        render(format(labors))
      } else {
        console.info(colorful.red('  No active browser.'))
      }
    })

  }).on('error', function(e) {
    logger.error('Server is not available, please check your config or try again later.')
  })
}


function format(labors) {
  var map = {}
  var table = []

  Object.keys(labors).forEach(function(laborId) {
    var labor = labors[laborId]
    var trait = labor.trait
    var key = genId(trait)
    var item = map[key] = map[key] || {trait: trait, amount: 0, free: 0}
    item.amount++
    if (labor.isFree) item.free++
  })

  Object.keys(map).forEach(function(key) {
    var item = map[key]
    var trait = item.trait
    table.push([
      trait.group,
      trait.agent.name + ' ' + trait.agent.version,
      trait.os.name + ' ' + trait.os.version,
      trait.device.name,
      item.amount,
      item.free
    ])
  })

  table.sort(function(a, b) {
    if (a.group < b.group) return -1
    if (a.group > b.group) return 1
    return 0
  })
  return table
}


function render(table) {
  table.unshift(['Group', 'Agent', 'OS', 'Device', 'Amount', 'Free'])
  var colWidth = getColWidth(table)
  var prevGroup

  console.log()
  table.forEach(function(row, rowIdx) {
    var rowContent = ''
    var curGroup = row[0]
    if (prevGroup === curGroup) {
      rowContent += ' ' + padding('', colWidth[0]) + ' '
    } else {
      if (rowIdx > 0) {
        console.log(genLineBreak(colWidth, rowIdx === 1 ? '=' : '-'))
      }
      rowContent += ' ' + padding(curGroup, colWidth[0]) + ' '
      prevGroup = curGroup
    }

    row.forEach(function(cell, colIdx) {
      if (colIdx > 0) rowContent += '| ' + padding(cell, colWidth[colIdx]) + ' '
    })

    console.log(rowContent)
  })
  console.log()
}


function genLineBreak(colWidth, chr) {
  var rt = ''
  chr = chr || '-'
  colWidth.forEach(function(w, idx) {
    if (idx) rt += '+'
    rt += utilx.generateLine(w + 2, chr)
  })
  return rt
}


function padding(item, w) {
  item = item + ''
  var len = item.length
  if (w <= len) {
    return item
  } else {
    return item + utilx.generateLine(w - len, ' ')
  }
}


function getColWidth(table) {
  var width = []
  table.forEach(function(row) {
    row.forEach(function(cell, colIdx) {
      var w = (cell + '').length
      width[colIdx] = Math.max(width[colIdx] || 0, w)
    })
  })
  return width
}


function genId(trait) {
  return trait.agent.name + ' ' + trait.agent.version + '/' +
         trait.os.name + ' ' + trait.os.version + '/' +
         trait.device.name + '/'
         trait.group
}
