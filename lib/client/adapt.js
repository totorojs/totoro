'use strict';

var path = require('path')
var fs = require('fs')

var logger = require('../logger')

var avilableAdapters = ['mocha']

module.exports = adapt

function adapt(content, adapter){
    if(adapter){
        // TODO
    }else{
        var scriptPattern = /<script.*?>.*?<\/script>/ig
        var adapterPattern = new RegExp(avilableAdapters.join('|'), 'ig')
        var result
        var i
        while((i = scriptPattern.exec(content)) !== null){
            var j = adapterPattern.exec(i[0])
            if(j){
                result = {
                    adapter: j[0],
                    script: i[0],
                    insertPos: i.index + i[0].length
                }
                logger.debug('found adapter "' + j[0] + '"')
                break
            }
        }
        if(result){
            var staticPath = path.join(__dirname, '..', '..', 'static')
            var adapterPath = path.join(staticPath, 'adapters', result.adapter + '.js')
            var onerrorPath = path.join(staticPath, 'adapters', 'onerror.js')
            var adapterContent = fs.readFileSync(adapterPath)
            var onerrorContent = fs.readFileSync(onerrorPath)
            content = content.substring(0, result.insertPos) +
                '<script src="/socket.io/socket.io.js"></script>' +
                '<script>' + onerrorContent + '</script>' +
                '<script>' + adapterContent + '</script>' +
                content.substring(result.insertPos)
            logger.debug('insert "' + result.adapter + '" adapter after "' + result.script + '"')
            return content
        }else{
            logger.error('can not guess which adapter should be used, "' +
                avilableAdapters +
                '" default suported, you should use them through script tag wihout name modification.')
        }
    }
}