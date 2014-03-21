define(function(require) {

  var expect = require('expect')

  describe('Test Suit', function() {

    it('Test Unit', function() {
      expect('assertion').to.be.a('string')
    })

    describe('Sub Test Suit', function() {
      it('Sub Test Unit', function() {
        expect('sub assertion').to.be.a('number')
      })
    })
  })
})
