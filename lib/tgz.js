/**!
 * totoro - lib/tgz.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var tar = require('tar')
var fstream = require('fstream')
var fs = require('fs')
var zlib = require('zlib')
var path = require('path')
var ignore = require('ignore')
var logger = require('./logger')

module.exports = function (options) {
  var root = options.root
  if (root[root.length - 1] !== '/') {
    root += '/'
  }

  var gitignore = ignore();
  var gitignoreFile = path.join(root, '.gitignore')
  if (fs.existsSync(gitignoreFile)) {
    gitignore.addIgnoreFile(gitignoreFile);
  }
  gitignore.addPattern(['node_modules', '.git'])

  return function (req, res, next) {
    if (req.query.__totoro_root_tgz !== 'true') {
      return next()
    }
    logger.info('tgz %s by req: %s', root, req.url)
    packDirectory(root, gitignore).pipe(res)
  }
}

function packDirectory(root, gitignore) {
  // This must be a "directory"
  var ws = fstream.Reader({ path: root, type: 'Directory',
    filter: function (entry) {
      var fullpath = entry.path.replace(root, '')
      if (gitignore.filter([fullpath]).length === 0) {
        return false;
      }
      logger.debug('tgz dir: %s', fullpath)
      return true;
    }
  })
  .pipe(tar.Pack({ noProprietary: true }))
  .pipe(zlib.createGzip())

  return ws
}
