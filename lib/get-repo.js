'use strict';

var exec = require('child_process').exec
var request = require('request')
var path = require('path')
var common = require('totoro-common')


module.exports = getRepo


function getRepo(runner, cb) {
    var dir = path.dirname(runner)
    var pkgPath

    if (common.isUrl(runner)) {
        pkgPath = dir + '/../package.json'
        get(pkgPath, cb)

    } else { // is local file
        pkgPath = path.join(dir, '..', 'package.json')
        if (common.isExistedFile(pkgPath)) {
            var pkg = require(pkgPath)
            cb(pkg.repository && pkg.repository.url)

        } else {
            getInfo('git', dir, function(repo) {
                if (repo) {
                    cb(repo)
                } else {
                    getInfo('svn', dir, function(repo) {
                        cb(repo)
                    })
                }
            })
        }
    }
}


function get(p, cb) {
    request(p, function (error, response, body) {
        var repo
        if (!error && response.statusCode == 200) {
            var pkg = JSON.parse(body)
            repo = pkg.repository && pkg.repository.url
        }
        cb(repo)
    })
}


var repoReg = {
    git: /remote\.origin\.url=(.+)$/m,
    svn: /URL: (.+)$/m
}

function getInfo(type, p, cb) {
    exec(type + ' info', {cwd: p}, function(err, stdout, stderr) {
        var repo
        if (!err) {
            var match = stdout.match(repoReg[type])
            if (match && match[1]) {
                repo = match[1]
            }
        }
        cb(repo)
    })
}