define(function(require) {
  var expect = require('expect')
  var example = require('example')

  describe('A Test Suite', function() {
    it('A Test Case', function() {
      expect(example()).to.be('A simple sample.')
    })
  })
})
