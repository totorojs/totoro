'use strict';

var common = require('totoro-common')
var colorful = require('colorful')


// default reporter
module.exports = function(labors, verbose) {
    // pull all failed labors to tail of rankedLabors
    // to make sure that user can see all failures by minimal scrolling
    var rankedLabors = []
    var failedLaborsAmount = 0
    Object.keys(labors).sort().reverse().forEach(function(browser) {
        var labor = labors[browser]
        if (!labor || !labor.stats || labor.stats.failures || labor.stats.error) {
            rankedLabors.push([browser, labor, 'red'])
            failedLaborsAmount++
        } else {
            rankedLabors.unshift([browser, labor, 'green'])
        }
    })
    var laborsAmount = rankedLabors.length

    println()
    rankedLabors.forEach(function(item) {
        println()
        var browser = item[0]
        var labor = item[1]
        var color = item[2]

        if (labor) {

            println('  ' + labor.ua, color)

            if (labor.stats) {
                // stats1: syntax error
                if (labor.stats.error) {
                    var error = labor.stats.error
                    var match = error.url.match(/runner\/.+?\/(.+)$/)
                    /*
                     * NOTE
                     *
                     * in safari on Windows 7（may because it dose not enable debugging tool）
                     * sometimes window.onerror handler may receives incorrect args
                     */
                    if (match) {
                        var p = match[1]
                        println('  An error occurred at: ' + p + ' [line ' + error.line + ']', color)
                        println('    ' + error.message, color)
                    } else {
                        println('  An unknown error occurred', color)
                    }

                // stats2: finished test, may pass or fail
                } else {
                    var stats = labor.stats

                    if (stats.failures) {
                        println('  Failed ' + stats.failures +
                            ' of ' + stats.tests +
                            ' tests in ' + stats.duration+ 'ms', color)
                    } else {
                        println('  Passed all of ' + stats.tests +
                            ' tests in ' + stats.duration+ 'ms' +
                            (stats.coverage ? ' (coverage ' + stats.coverage.coverage.toFixed(2) + '%)' : ''),
                            color)

                        var covMisses = (stats.coverage && stats.coverage.missesDetail) || {}
                        if (verbose && Object.keys(covMisses).length > 0) {
                            println('    Coverage misses lines:', 'yellow')
                            Object.keys(covMisses).forEach(function(src) {
                                println('      ' + src + ': ' + showLines(covMisses[src]).join(', '), 'yellow')
                            })
                        }
                    }

                    labor.failures.forEach(function(info) {
                        println('    ' +
                            info.parent + ' > ' +
                            info.title + ' > ' +
                            info.message, color)
                    })

                }

            // stats3: client timeout
            } else {
                println('  Client timeout', color)
            }

        // stats4: not found matched browser
        } else {
            println('  ' + browser, color)
            println('  Not found matched browser', color)
        }
    })
    println()

    var color
    var summary
    if (failedLaborsAmount) {
        color = 'red'
        summary = 'Failed on ' + failedLaborsAmount + ' of ' + laborsAmount + ' browsers'
    } else {
        color = 'green'
        summary = 'Passed on all of ' + laborsAmount + ' browsers'
    }
    var sliptLine = new Array(summary.length + 5).join('=')
    println(sliptLine, color)
    println('  ' + summary, color)
    println(sliptLine, color)
    println()
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

function showLines(lines) {
    var arr = []
    var currLine = -1
    var tempArr = []
    lines.forEach(function(line) {
        if (tempArr.length == 0) {
            tempArr.push(line)
        } else {
            if ((line - currLine) == 1) {
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
