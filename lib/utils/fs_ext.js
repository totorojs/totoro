'use strict';

var fs = require('fs')
var path = require('path')


// 找到指定目录中的所有文件
var findFiles = exports.findFiles = function(dir, filter, files) {
    filter = perfectFilter(filter)
    files = files || []

    // 对于隐藏目录不处理.
    if (path.basename(dir).indexOf('.') === 0) {
        return files
    }

    if (isDirectory(dir)) {
        fs.readdirSync(dir).forEach(function(filename) {
            var file = path.join(dir, filename)
            findFiles(path.join(dir, filename), filter, files)
        })
    } else if (isFile(dir) && filter(dir)) {
        files.push(dir)
    }

    return files
}

function isDirectory(filepath) {
    return fs.statSync(filepath).isDirectory()
}

function isFile(filepath) {
    return fs.statSync(filepath).isFile()
}


function perfectFilter(filter) {
    if (!filter) {
        return function() {
          return true
        }
    }

    if (filter instanceof RegExp) {
        return function(file) {
            return filter.test(path.basename(file))
        }
    }

    return filter
}
