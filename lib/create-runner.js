'use strict';

var logging = require('winston')
var path = require('path')
var fs = require('fs')
var hogan = require("hogan.js")
var _ = require('underscore')

module.exports = createRunner


/**
 * 创建 runner
 * @param testDir
 * @returns runner 文件路径
 */
function createRunner(testDir) {
    var name = 'runner.html'
    var runner = path.join(testDir, name)
    var testFiles = findTestFiles(testDir)
    var testStyle = findTestStyle(testFiles)
    var alias = findAlias(testDir)
    var useDeps = JSON.stringify(testFiles.map(function(f) {
        return './' + path.relative(testDir, f)
    }))

    var info = {
        testStyle: testStyle,
        alias: alias,
        useDeps: useDeps
    }
    
    renderRunner(runner, info)
    logging.debug('create runner.html')
    return runner
}




// 查找所有测试脚本
function findTestFiles(testDir) {
    return findFiles(testDir, isTestFile);
}


/*
 * 判断是否为测试文件
 * 只要是文件名中有 spec 或 test 的 js 文件，不区分大小写，即认为是测试文件
 */
var testFilePattern = /^.*(test|spec).*\.js$/i
function isTestFile(file) {
    var name = path.basename(file)
    return testFilePattern.test(name)
}


// 查找测试脚本使用的是 bdd 还是 tdd 的测试风格
function findTestStyle(testFiles){
    return 'bdd'
}


// 返回 package.json 的 dependencies.alias 或空对象
function findAlias(testDir) {
    var pkgPath = path.join(testDir, '..', 'package.json')
    var pkgStr = fs.existsSync(pkgPath) ? fs.readFileSync(pkgPath) : '{}'
    var pkg = JSON.parse(pkgStr)
    var alias = pkg.dependencies || {}
    alias['$'] = alias['jquery'] = 'gallery/jquery/1.7.2/jquery'
    alias['expect.js'] = 'gallery/expect.js/0.2.0/expect.js'
    alias['sinon'] = 'gallery/sinon/1.6.0/sinon.js'
    alias['event-silumate'] = 'arale/event-simulate/1.0.0/event-simulate'
    return JSON.stringify(alias)
}


// 渲染 runner 页面
function renderRunner(p, info) {
    var templPath = path.join(path.dirname(module.filename), '../static/runner.html')
    var tmpl = hogan.compile(fs.readFileSync(templPath) + '')
    fs.writeFileSync(p, tmpl.render(info), 'utf-8')
}


// 找到指定目录中的所有文件
function findFiles(dir, filter, files) {
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

function perfectFilter(filter) {
    if (!filter) {
        return function() {
          return true
        }
    }

    if (_.isRegExp(filter)) {
        return function(file) {
            return filter.test(path.basename(file))
        }
    }

    return filter
}


function isDirectory(filepath) {
    return fs.statSync(filepath).isDirectory()
}

function isFile(filepath) {
    return fs.statSync(filepath).isFile()
}

