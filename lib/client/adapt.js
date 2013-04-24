'use strict';

var path = require('path')
var fs = require('fs')

var logger = require('../logger')
var utils = require('../utils')


module.exports = adapt

var availableAdapters = module.exports.availableAdapters = ['mocha', 'jasmine']

function adapt(content, adapter) {
    if (utils.isAbsolute(adapter) || availableAdapters.indexOf(adapter) > -1) {
        var match = content.match(/<\/head>/)
        if (match) {
            return addAdapter(content, adapter, match.index)
        } else {
            logger.error('can not add adapter')
        }
    } else {
        var scriptPattern = /<script.*?>.*?<\/script>/ig
        var adapterPattern = new RegExp(availableAdapters.join('|'), 'ig')
        var result
        var i
        while ((i = scriptPattern.exec(content)) !== null) {
            var j = adapterPattern.exec(i[0])
            if (j) {
                result = {
                    adapter: j[0],
                    script: i[0],
                    insertPos: i.index + i[0].length
                }
                logger.debug('found adapter "' + j[0] + '"')
                break
            }
        }
        if (result) {
            return addAdapter(content, result.adapter, result.insertPos)
        } else {
            logger.error('can not guess which adapter should be used, "' +
                availableAdapters +
                '" default suported, you should use them through script tag wihout name modification.')
        }
    }
}

function addAdapter(content, adapterPath, position) {
    var staticPath = path.join(__dirname, '..', '..', 'static')

    if (!utils.isAbsolute(adapterPath)) {
        adapterPath = path.join(staticPath, 'adapters', adapterPath + '.js' )
    }

    var adapterContent = fs.readFileSync(adapterPath)
    var onerrorPath = path.join(staticPath, 'adapters', 'onerror.js')
    var onerrorContent = fs.readFileSync(onerrorPath)

    content = content.substring(0, position) +
            '<script>' + onerrorContent + '</script>' +
            '<script>' + adapterContent + '</script>' +
            content.substring(position)
    return content
}
