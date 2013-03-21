var logging = require('winston')
var fsExt = require('../utils/fs_ext.js')
var _ = require('underscore');

module.exports = function(commander, options, cb) {
    var browsers = commander.browsers
    if (!browsers) {
       cb()
       return 
    }

    // 读取浏览器信息
    if (_.isBoolean(browsers)) {
        getBrowsers(options, function(validBrowsers) {
           
            logging.info(getValidBrowsers(validBrowsers))

            // 阻止程序继续执行
            cb(true)
        })
      
    } else {
       // 指定浏览器进行执行
       options.filter = filterBrowsers(browsers)

       getBrowsers(options, function(validBrowsers) {
           var browsers = _.filter(validBrowsers, function(b) {
               return options.filter(b)
           });

           if (browsers.length === 0) {
               logging.info('没有找到你指定的浏览器')

               logging.info(getValidBrowsers(validBrowsers))

               cb(true)
            
           } else {
               cb()
           }
       })
    }
}

function getValidBrowsers(browsers) {
    browsers = _.uniq(browsers.map(
             function(b) {
                 return b.name
             }))

     var str = '当前有效的浏览器:\n'
     browsers.forEach(function(b) {
         str += '    ' + b + '\n'
     }) 

     return str
}

function getBrowsers(options, cb) {
    var browsers;
    require('totoro-queen-remote').client({
        callback: function(queen) {

            if (queen.workerProviders.length < 1) {
                logging.info('Not found valid browsers!')
            } else {
                browsers = _.sortBy(queen.workerProviders, function(str) {
                    return str.toString()
                }).map(function(provider) {
                    var attrs = provider.attributes
                    return {
                        name: attrs.name,
                        family: attrs.family,
                        version: attrs.version,
                    }
                });
            }
            cb(browsers)
        },
        host: options.queenHost
    })
}

function filterBrowsers(browsers) {
    var obj = {};
    browsers.split(',').forEach(function(b) {
        var browser = parseVersion(b)
        var bName = browser[0]
        var bVer = browser[1]
        var vers = obj[bName] || (obj[bName] = [])

        if (vers.indexOf(bVer) < 0) {
            vers.push(bVer) 
        }
    })

    return function(browser) {
        var name = browser.family.toLowerCase()
        var ver = browser.version.major
        var vers = obj[name]

        if (!vers) {
            return false
        }

        return vers.indexOf('*') > -1 || vers.indexOf(ver) > -1
    }
}

var verReg = /^([a-zA-Z]+)\/?(\d*)$/
function parseVersion(name) {
    var match = name.match(verReg)
    return [match[1], match[2] || '*']
}


