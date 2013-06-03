define(function(require) {

    var expect = require('expect')

    describe('A Test Suite', function() {

        it('contains spec with an expectation', function() {
            expect('totoro').to.be.a('string')
        })

    })
})
