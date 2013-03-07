'use strict'

var logging = require('winston')
var path = require('path')
var fs = require('fs')
var hogan = require("hogan.js")
var _ = require('underscore')

var detectFrames = require('./detect-frames')

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
    var testFrames = findTestFrames(testDir, testFiles)
    var pkgPath = path.join(process.cwd(), 'package.json')
    var pkgStr = '{}'

    if (fs.existsSync(pkgPath)) {
        pkgStr = fs.readFileSync(pkgPath)
    }

    testFiles = testFiles.map(function(f) {
        return './' + path.relative(testDir, f) 
    })

    var pkg = JSON.parse(pkgStr)
    var deps = findTestDependencies(testFiles, pkg.dependencies || {}, findSrcFiles())
    var alias = findAlias(pkg.dependencies || {})
    var info = {
        deps : deps,
        alias : alias
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
var testFilePattern = new RegExp('^.*(test|spec).*\.js$', 'i')
function isTestFile(file) {
    var name = path.basename(file)
    return testFilePattern.test(name)
}


// 查找使用的测试框架
function findTestFrames(testDir, testFiles) {
    // testDir 用于查找 package.json
    // 如果 package.json 中提供了测试框架配置，则使用配置中的框架信息
    // 否则搜索测试文件，以探测测试框架
    return detectFrames(testFiles)
}


// 查找所有测试用例的依赖
function findTestDependencies(testFiles, deps, srcs) {
    checkJquery(deps)
    return JSON.stringify(_.keys(deps).concat(srcs).concat(testFiles))
}


function checkJquery(deps) {
    _.keys(deps).forEach(function(key) {
      if (key == '$' && deps[key] == '$') {
          deps[key] = 'gallery/jquery/1.7.2/jquery'
      } 
    })
}


// 查找所有源文件
function findSrcFiles() {
    var baseDir = process.cwd()
    return findFiles(path.join(baseDir, 'src'), /\.js$/).map(function(f) {
        return '../' + path.relative(baseDir, f) 
    })
}


// 对于全局依赖，我们需要生成 alias
function findAlias(deps) {
    return 'seajs.config({alias:' + JSON.stringify(deps) + '})'
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

