var logging = require('winston');
var path = require('path')
var fs = require('fs')


/**
 * 为指定测试目录创建 runner 文件
 * 
 * @param testDir
 * @returns 创建的 runner 文件的路径
 */
function createRunner(testDir){
	var name = 'runner.html'
	var runner = path.join(testDir, name)
	var files = fs.readdirSync(testDir)
	logging.debug(files)
}


module.exports = createRunner