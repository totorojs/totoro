'use strict';

var path = require('path')
var expect = require('expect.js')
var rewire = require('rewire')

var getRepo = rewire('../lib/get-repo')


describe('get-repo', function() {
  it('_get', function(done) {
    var _get = getRepo.__get__('get')
    _get('http://aralejs.org/base/package.json', function(repo) {
      expect(repo).to.be('https://github.com/aralejs/base.git')
      done()
    })
  })

  it('_getInfo', function(done) {
    var _getInfo = getRepo.__get__('getInfo')
    _getInfo('git', process.cwd(), function(repo) {
      expect(repo).to.match(/github\.com.totorojs\/totoro\.git/)
      done()
    })
  })

  describe('getRepo', function() {
    it('runner is url', function(done) {
      getRepo('http://aralejs.org/base/tests/runner.html', function(repo) {
        expect(repo).to.be('https://github.com/aralejs/base.git')
        done()
      })
    })

    it('runner is local file with package.json', function(done) {
      getRepo(__filename, function(repo) {
        expect(repo).to.be('git@github.com:totorojs/totoro.git')
        done()
      })
    })

    it('runner is local file without package.json', function(done) {
      getRepo(path.join(__dirname, '..', 'examples', 'syntax-error', 'tests', 'runner.html'), function(repo) {
        expect(repo).to.match(/github\.com.totorojs\/totoro\.git/)
        done()
      })
    })
  })
})
