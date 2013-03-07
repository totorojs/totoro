var logging = require('winston');
var path = require('path')
var fs = require('fs')
var template = require('swig')


module.exports = createRunner


/**
 * 创建 runner
 * @param testDir
 * @returns runner 文件路径
 */
function createRunner(testDir){
	var name = 'runner.html'
	var runner = path.join(testDir, name)
	var testFiles = findTestFiles(testDir)
	var testFrames = findTestFrames(testDir, testFiles)
	renderRunner(runner, {})
	logging.debug('create runner.html')
	return runner
}


// 查找所有测试脚本
function findTestFiles(testDir){
	var testFiles = []
	var children = fs.readdirSync(testDir)
	for(var i = 0; i < children.length; i++){
		var p = path.join(testDir, children[i])
		var stat = fs.statSync(p)
		if(stat.isFile()){
			if(isTestFile(p)){
				testFiles.push(p)
			}
		}else if(stat.isDirectory()){
			testFiles = testFiles.concat(findTestFiles(p))
		}
	}
	return testFiles
}


/*
 * 判断是否为测试文件
 * 只要是文件名中有 spec 或 test 的 js 文件，不区分大小写，即认为是测试文件
 */
var testFilePattern = new RegExp('^.*(test|spec).*\.js$','i')
function isTestFile(file){
	var name = path.basename(file)
	return testFilePattern.test(name)
}


// 查找使用的测试框架
function findTestFrames(testDir, testFiles){
	// testDir 用于查找 package.json
	// 如果 package.json 中提供了测试框架配置，则使用配置中的框架信息
	// 否则搜索测试文件，以探测测试框架
	return ['mocha', 'expect']
}


// 渲染 runner 页面
function renderRunner(p, info){
	var templPath = path.resolve(path.relative(__dirname, '../static/runner.html'))
	var tmpl = template.compileFile(templPath)
	fs.writeFileSync(p, tmpl.render(info), 'utf-8')
}

















