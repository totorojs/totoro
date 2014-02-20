define(function(require) {

    var expect = require('expect')

    var test = require('example')

    describe('Test Suit', function() {

        it('Test Unit', function() {
            expect(test.say()).to.be('hello')
            expect('assertion').to.be.a('string')
        })

    })
})
