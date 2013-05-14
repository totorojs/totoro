'use strict';

var fs = require('fs')
var path = require('path')
var colorful = require('colorful')

var print = exports.print = function(str, color) {
    str = str || ''
    str = color ? colorful[color](str) : str
    process.stdout.write(str)
}

exports.println = function(str, color) {
    print(str, color)
    process.stdout.write('\n')
}

