'use strict'

var logging = require('winston')
var fs = require('fs')

var JASMINE = 'jasmine'
var MOCHA = 'mocha'
var EXPECT = 'expect'
var SINON = 'sinon'

var BDD = 'bdd'
var TDD = 'tdd'


module.exports = detectFrames


/**
 * 测试框架检测
 * 
 * 测试框架由 测试套件 + 断言 + spy、stub、mock 组成
 * 先探测使用的是 jasmine 还是 mocha
 * 如果是 jasmine，则认为全套都是 jasmine
 * 如果是 mocha，则再探测断言和 spy、stub、mock
 * 目前使用 mocha 的话，则固定是 mocha + expect + sinon 的搭配，以后再考虑扩展支持
 * 
 * note：为什么我们不选择以下库？
 * 1. should.js 只支持 node 端
 * 2. chai 对 ie 支持有问题
 * 
 * @param {Object} testFiles
 * @returns {Object}
 */
function detectFrames(testFiles) { 
    var rt
    var testSuit
    var testStyle
    
    for(var i = 0, len = testFiles.length; i < len; i++){
        var content = fs.readFileSync(testFiles[i])
        if(!testSuit){
            testSuit = detectTestSuit(content)
        }
        
        if(testSuit === JASMINE){
            rt = {testFrames: [JASMINE], testStyle: BDD}
            break
        }
        
        if(!testStyle){
            testStyle = detectTestStyle(content)
        }
        if((testSuit === MOCHA) && testStyle){
            rt = {testFrames:[MOCHA, EXPECT, SINON], testStyle: testStyle}
            break
        }
        
        if(i === len - 1){
            // 不同测试框架的语法会有大部分重叠
            // 如果在最后一个文件检测完毕后，还无法确认测试框架
            // 则认为是 [MOCHA, EXPECT, SINON] 的方案
            testSuit = MOCHA
            testStyle = testStyle || BDD
            rt = {testFrames:[MOCHA, EXPECT, SINON], testStyle: testStyle}
        }
    }
    
    logging.debug('detect test frames: ', rt)
    return rt
}


/**
 * 检测测试套件
 * 
 * @param {Object} content 测试脚本内容
 * @returns {String} 确认使用的测试框架：mocha 或 jasmine，如果无法确认则返回 null 
 */
function detectTestSuit(content){
    return MOCHA
}


/**
 * 检测测试风格
 * 
 * @param {Object} content
 * @returns {String} 确认使用的测试风格：bdd 或 tdd，如果无法确认则返回 null
 */
function detectTestStyle(content){
    return BDD
}
