'use strict';

var util = require('util')

var common = require('totoro-common')
var colorful = require('colorful')


// default reporter
module.exports = function(labors, cfg) {
  // pull all failed labors to tail of rankedLabors
  // to make sure that user can see all failures by minimal scrolling
  var rankedLabors = []
  var failedAmount = 0
  Object.keys(labors).sort().reverse().forEach(function(browser) {
    var labor = labors[browser]
    if (!labor || !labor.stats || labor.stats.failures) {
      rankedLabors.push([browser, labor, 0])
      failedAmount ++
    } else {
      rankedLabors.unshift([browser, labor, 1])
    }
  })

  println()
  rankedLabors.forEach(function(item) {
    println()
    var browser = item[0]
    var labor = item[1]

    if (labor) {
      println('  ' + labor.ua, item[2] ? 'green' : 'red')
      var stats = labor.stats
      var errors = labor.errors

      if (stats) {            printStats(labor, cfg) }
      else {                  println('  Timeout', 'red') }
      if (errors) {           printErrorMsgs(errors) }
      if (labor.customLogs) { printCustomLogs(labor.customLogs) }

    } else {
      println('  ' + browser, 'red')
      println('  Not found matched browser', 'red')
    }
  })
  println()

  var amount = rankedLabors.length
  printSummary(amount, failedAmount)
  return !failedAmount
}


function print(str, c) {
  str = str || ''
  str = c ? colorful[c](str) : str
  process.stdout.write(str)
}


function println(str, c) {
  print(str, c)
  process.stdout.write('\n')
}


function printStats(labor, cfg) {
  // do nothing when --code
  if (!Object.keys(labor.stats).length) return

  var stats = labor.stats
  if (stats.failures) {
    var failMsg = '  Failed '
    if (stats.failures === stats.tests) {
      failMsg += 'all'
    } else {
      failMsg += stats.failures
    }
    failMsg += ' of ' + stats.tests + ' tests in ' + stats.duration+ 'ms'
    println(failMsg, 'red')

    labor.failures.forEach(function(info) {
      println('    ' +
        info.parent + ' > ' +
        info.title + ': ' +
        info.message, 'red')
    })

  } else {
    println('  Passed all of ' + stats.tests +
      ' tests in ' + stats.duration+ 'ms' +
      (stats.coverage ? ' (coverage ' + stats.coverage.coverage.toFixed(2) + '%)' : ''),
      'green')

    var covMisses = (stats.coverage && stats.coverage.missesDetail) || {}
    if (cfg.verbose && Object.keys(covMisses).length > 0) {
      println('    Coverage misses lines:', 'yellow')
      Object.keys(covMisses).forEach(function(src) {
        println('      ' + src + ': ' + showLines(covMisses[src]).join(', '), 'yellow')
      })
    }
  }
}


function printErrorMsgs(errors) {
  errors.forEach(function(error) {
    var color = 'red'
    if (error.url) {
      var match = error.url.match(/:\/\/[^\/]+\/(.+)$/)
      /*
       * NOTE
       *
       * in safari on Windows 7 (may because it dose not enable debugging tool)
       * sometimes window.onerror handler may receives incorrect args
       */
      if (match) {
        var p = match[1].replace(/(\?|&)?__totoro_oid=[^&#]+/, '')
        println('    > ' + error.message + ' ('+ p + ':' + error.line + ')', color)
      } else {
        println('    > An unknown error occurred', color)
      }

    } else {
      println('    > ' + error.message, color)
    }
  })
}


function printCustomLogs(logs) {
  logs.forEach(function(log) {
    log = log.map(function(arg) {
      return typeof arg === 'string' ? arg : util.inspect(arg)
    })
    println('    > ' + log.join(' '), 'gray')
  })
}


function printSummary(amount, failedAmount) {
  var color
  var summary
  if (failedAmount) {
    color = 'red'
    summary = 'Failed on ' + (amount === failedAmount ? 'all' : failedAmount) + ' of ' + amount + ' browsers'
  } else {
    color = 'green'
    summary = 'Passed on all of ' + amount + ' browsers'
  }
  var sliptLine = new Array(summary.length + 5).join('=')
  println(sliptLine, color)
  println('  ' + summary, color)
  println(sliptLine, color)
  println()
}


function showLines(lines) {
  var arr = []
  var currLine = -1
  var tempArr = []
  lines.forEach(function(line) {
    if (tempArr.length === 0) {
      tempArr.push(line)
    } else {
      if ((line - currLine) === 1) {
        tempArr.push(line)
      } else {
        arr.push(tempArr)
        tempArr = [line]
      }
    }
    currLine = line
  })

  return arr.map(function(lines) {
    if (lines.length > 2) {
      return lines[0] + '~' + lines[lines.length -1]
    } else {
      return lines.join(', ')
    }
  })
}