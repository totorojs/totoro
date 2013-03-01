var logging = require('winston');
var path = require('path')
var fs = require('fs')
var template = require('swig')


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


// 判断是否为测试文件
var testFilePattern = new RegExp('^.*(test|spec).*\.js$','i')
function isTestFile(file){
	var name = path.basename(file)
	return testFilePattern.test(name)
}


// 探测使用的测试框架
function findTestFrames(testDir, testFiles){
	return ['mocha', 'expect']
}


// 渲染 runner 页面
function renderRunner(p, info){
	var templPath = path.resolve(path.relative(__dirname, '../static/runner.html'))
	var tmpl = template.compileFile(templPath)
	fs.writeFileSync(p, tmpl.render(info), 'utf-8')
}


module.exports = createRunner














