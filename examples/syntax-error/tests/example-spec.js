define(function(require) {
  var expect = require('expect')
  var example = require('example')

  describe('Test Suit', function() {
    it('Test Unit', function() {
      expect(example()).to.be('A simple sample.')
    })
  })
})
