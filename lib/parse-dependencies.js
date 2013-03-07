'use strict'

var UglifyJS = require('uglify-js')
var path = require('path')
var fs = require('fs')
var _ = require('underscore')


module.exports = parseDependencies


function parseDependencies(files) {
    var deps = []
    files.forEach(function(f) {
        var ast = getAst(f)
        var _deps = parseRequire(ast)
        deps.splice.apply(deps, [_deps.length, 0].concat(_deps))
    })
    return _.uniq(deps)
}


// 解析动态依赖，主要通过找到代码中的 require('jquery'); 语句。
// ['jquery']
function parseRequire(ast) {
    ast = getAst(ast)

    var deps = []
    var call_expression = null

    var walker = new UglifyJS.TreeWalker(function(node, descend) {
        if ( node instanceof UglifyJS.AST_Call && node.start.value === 'require' && node.expression.name === 'require') {
            var temp = call_expression
            call_expression = node
            descend()
            call_expression = temp
            return true
        }

        if (call_expression && node instanceof UglifyJS.AST_String) {
            deps.push(node.getValue())
        }
    })

    ast.walk(walker)
    return deps
}

function getAst(inputFile) {
    if (!_.isString(inputFile))
        return inputFile

    if (fs.existsSync(inputFile)) {
        inputFile = fs.readFileSync(inputFile) + ''
    }

    return UglifyJS.parse(inputFile, {
        comments : true
    })
}
