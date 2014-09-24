'use strict';

var exec = require('child_process').exec
var request = require('request')
var path = require('path')
var fs = require('fs')
var utilx = require('utilx')


module.exports = getRepo


function getRepo(runner, cb) {
  var dir = path.dirname(runner)
  var pkgPath
  if (utilx.isUrl(runner)) {
    pkgPath = dir + '/../package.json'
    get(pkgPath, cb)

  } else { // is local file
    pkgPath = path.join(dir, '..', 'package.json')
    if (utilx.isExistedFile(pkgPath)) {
      var pkg = JSON.parse(fs.readFileSync(pkgPath))
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
    if (!error && response.statusCode >= 200 && response.statusCode <= 399) {
      try {
        var pkg = JSON.parse(body)
      } catch (e) {
        pkg = {}
      }
      repo = pkg.repository && pkg.repository.url
    }
    cb(repo)
  })
}


var repoReg = {
  git: /origin\s+([^\s]+)\s+\((?:fetch|push)\)$/m,
  svn: /Repository Root: (.+)$/m
}

function getInfo(type, p, cb) {
  var cmd = type === 'git' ? 'git remote -v' : 'svn info'
  exec(cmd, {cwd: p}, function(err, stdout, stderr) {
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
