'use strict';

var fs = require('fs')
var path = require('path')

exports.getExternalIpAddress = function() {
    var interfaces = require('os').networkInterfaces()
    var addresses = []
    Object.keys(interfaces).forEach(function(name) {
        var iface = interfaces[name]
        for (var i in iface) {
            var node = iface[i]
            if(node.family === 'IPv4' && node.internal === false) {
                addresses = addresses.concat(node)
            }
        }
    })
    if (addresses.length > 0) {
        return addresses[0].address
    }
}

exports.mix = function(target, src, ow) {
    target = target || {}
    for (var i in src) {
        if (ow || typeof target[i] === 'undefined') {
            target[i] = src[i]
        }
    }
    return target
}

var findFiles = exports.findFiles = function(dir, filter) {
    var files = []
    dir = path.resolve(dir)
    filter = perfectFilter(filter)
    if (path.basename(dir)[0] !== '.') {
        fs.readdirSync(dir).forEach(function(name, idx, list) {
            var p = path.join(dir, name)
            if (fs.statSync(p).isFile() && filter(name)) {
                files.push(p)
            } else if (fs.statSync(p).isDirectory()) {
                files = files.concat(findFiles(p, filter))
            }
        })
    }
    return files
}

function perfectFilter(filter) {
    if (!filter) {
        return function() {
          return true
        }
    }
    if (filter instanceof RegExp) {
        return function(file) {
            return path.basename(file).match(filter)
        }
    }
    return filter
}


/**
 * home and isAbsolute
 */

var isWindows = exports.isWindows = process.platform === 'win32'
if (isWindows) {

  // Regex to split a windows path into three parts: [*, device, slash, tail] windows-only
  var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?([\\\/])?([\s\S]*?)$/;

  // Returns true if the path given is absolute.
  exports.isAbsolute = function(p) {
    if (!p) return false

    var result = splitDeviceRe.exec(p),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':'

    return !!result[2] || isUnc // UNC paths are always absolute
  }
} else {

  // Returns true if the path given is absolute.
  exports.isAbsolute = function(p) {
    if (!p) return false
    return p[0] === '/'
  }
}

exports.home = (isWindows ? process.env.USERPROFILE : process.env.HOME)


/**
 * useragent
 */

var OS = /(iPhone OS|Mac OS X|Windows|Linux)/;
var OS_MAP = {
  'iPhone OS': 'iOS',
  'Mac OS X': 'Mac'
};

var BROWSER = /(Chrome|Firefox|Opera|Safari|PhantomJS)\/([0-9]*\.[0-9]*)/;
var VERSION = /Version\/([0-9]*\.[0-9]*)/;
var MSIE = /MSIE ([0-9]*\.[0-9]*)/;

// TODO(vojta): parse IE, Android, iPhone, etc...
exports.browserFullNameToShort = function(fullName) {
  var os = '';
  var osMatch = fullName.match(OS);
  if (osMatch) {
    os = osMatch[1];
    os = ' (' + (OS_MAP[os] || os) + ')';
  }

  var browserMatch = fullName.match(BROWSER);
  if (browserMatch) {
    var versionMatch = fullName.match(VERSION);
    return browserMatch[1] + ' ' + (versionMatch && versionMatch[1] || browserMatch[2]) + os;
  }

  var ieMatch = fullName.match(MSIE);
  if (ieMatch) {
    return 'IE ' + ieMatch[1] + os;
  }

  return fullName;
};

exports.parseUserAgent = function(userAgent) {
    var fullName = exports.browserFullNameToShort(userAgent);
    return [fullName.split(' ')[0], fullName];
};
