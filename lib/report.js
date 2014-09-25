'use strict';

var util = require('util')
var colorful = require('colorful')


// default reporter
module.exports = function(data) {
  // pull all failed labors to tail of rankedLabors
  // to make sure that user can see all failures by minimal scrolling
  var rankedData = []
  var failedAmount = 0
  Object.keys(data).sort().reverse().forEach(function(traitStr) {
    var labor = data[traitStr]
    if (!labor.info || !labor.info.stats || labor.info.stats.failures) {
      rankedData.push([labor, 0])
      failedAmount ++
    } else {
      rankedData.unshift([labor, 1])
    }
  })

  rankedData.forEach(function(item) {
    println()
    var labor = item[0]
    var traitStr = perfectTraitStr(labor.matchedLabor || labor.requiredLabor)
    var tryTimes = labor.tryTimes

    if (tryTimes) {
      println('  ' + traitStr, item[1] ? 'green' : 'red')
      var info = labor.info

      if (info) {
        info.stats && printStats(info)
        info.errors && printErrorMsgs(info.errors)
        info.customLogs && printCustomLogs(info.customLogs)
      } else {
        if (tryTimes >= 3) {
          println('  Terminated by server because try too many times', 'red')
        } else {
          println('  Timeout', 'red')
        }
      }

    } else {
      println('  ' + traitStr, 'red')
      println('  Not found matched labor', 'red')
    }
  })
  println()

  var amount = rankedData.length
  printSummary(amount, failedAmount)
  return !failedAmount
}


function perfectTraitStr(trait) {
  var str = (trait.agent.name || '') + ' ' + (trait.agent.version || '') +
            ' / ' +
            (trait.os.name || '') + ' ' + (trait.os.version || '')
      str = str.replace(/[ \/]+$/, '').replace(/ +/, ' ')
  return str[0].toUpperCase() + str.slice(1)
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


function printStats(info) {
  // do nothing when --code
  if (!Object.keys(info.stats).length) return

  var stats = info.stats
  if (stats.failures) {
    var failMsg = '  Failed '
    if (stats.failures === stats.tests) {
      failMsg += 'all'
    } else {
      failMsg += stats.failures
    }
    failMsg += ' of ' + stats.tests + ' tests in ' + stats.duration+ 'ms'
    println(failMsg, 'red')

    info.failures.forEach(function(f) {
      println('    ' +
        f.parent + ' > ' +
        f.title + ': ' +
        f.message, 'red')
    })

  } else {
    println('  Passed all of ' + stats.tests +
      ' tests in ' + stats.duration+ 'ms' +
      (stats.coverage ? ' (coverage ' + stats.coverage.coverage.toFixed(2) + '%)' : ''),
      'green')

    /*
    var covMisses = (stats.coverage && stats.coverage.missesDetail) || {}
    if (cfg.verbose && Object.keys(covMisses).length > 0) {
      println('    Coverage misses lines:', 'yellow')
      Object.keys(covMisses).forEach(function(src) {
        println('      ' + src + ': ' + showLines(covMisses[src]).join(', '), 'yellow')
      })
    }
    */
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
        var p = match[1]
                .replace(/(\?|&)?__totoro_oid=[^&#]+/, '')
                .replace(/(\?|&)?__totoro_lid=[^&#]+/, '')
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