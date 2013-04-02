'use strict';

var path = require('path')
var fs = require('fs')

var logger = require('./logger')
var avilableAdapters = require('./config').avilableAdapters


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
            var adapterPath = path.join(path.dirname(module.filename), 'adapters', result.adapter + '.js')
            var adapterContent = fs.readFileSync(adapterPath)
            content = content.substring(0, result.insertPos)
                    + '<script>'
                    + adapterContent
                    + '</script>'
                    + content.substring(result.insertPos)
            console.log(content)
            return content
        }else{
            logger.error('can not guess which adapter should be used, "' + avilableAdapters + '" default suported, you should use them through script tag wihout name modification.')
        }
    }
}