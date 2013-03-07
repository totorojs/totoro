var logging = require('winston');
var path = require('path');
var fs = require('fs');
var hogan = require("hogan.js");

var parseDeps = require('./parse-dependencies.js');

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
	var deps = findTestDependencies(testFiles);
	var alias = findAlias(deps);
	var info = {
      deps: deps,
      alias: alias
    };

	renderRunner(runner, info); 
	logging.debug('create runner.html')
	return runner
}


// 查找所有测试脚本
function findTestFiles(testDir) {
	var testFiles = []
	var children = fs.readdirSync(testDir)
	for(var i = 0; i < children.length; i++) {
		var p = path.join(testDir, children[i])
		var stat = fs.statSync(p)
		if(stat.isFile()){
			if(isTestFile(p)){
				testFiles.push(p)
			}
		}else if(stat.isDirectory()) {
			testFiles = testFiles.concat(findTestFiles(p))
		}
	}
	return testFiles
}

// 查找所有测试用例的依赖
function findTestDependencies(testFiles) {
  return JSON.stringify(parseDeps(testFiles));
}

// 对于全局依赖，我们需要生成 alias
function findAlias(deps) {
  var pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
  return 'seajs.config({alias:' + JSON.stringify(pkg.dependencies || {}) + '})';
}

/*
 * 判断是否为测试文件
 * 只要是文件名中有 spec 或 test 的 js 文件，不区分大小写，即认为是测试文件
 */
var testFilePattern = new RegExp('^.*(test|spec).*\.js$','i')
function isTestFile(file) {
	var name = path.basename(file)
	return testFilePattern.test(name)
}


// 探测使用的测试框架
function findTestFrames(testDir, testFiles) {
	return ['mocha', 'expect']
}


// 渲染 runner 页面
function renderRunner(p, info) {
	var templPath = path.join(path.dirname(module.filename), '../static/runner.html');
	var tmpl = hogan.compile(fs.readFileSync(templPath) + '');
	fs.writeFileSync(p, tmpl.render(info), 'utf-8');
}

module.exports = createRunner














