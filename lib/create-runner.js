var logging = require('winston');
var path = require('path')
var fs = require('fs')


// 创建 runner
function createRunner(testDir){
	var name = 'runner.html'
	var runner = path.join(testDir, name)
	var testFiles = findTestFiles(testDir)

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


function isTestFile(file){
	return true
}


module.exports = createRunner