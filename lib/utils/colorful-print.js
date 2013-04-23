'use strict';

var colorful = require('colorful')

exports.print = print
exports.println = println

function print(str, color) {
    str = str || ''
    str = color ? colorful[color](str) : str
    process.stdout.write(str)
}

function println(str, color) {
    print(str, color)
    process.stdout.write('\n')
}
