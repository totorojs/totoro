define(function(require) {
    var expect = require('expect')
    var simple = require('simple')

    describe('A Test Suite', function() {
        it('A Test Case', function() {
            expect(simple()).to.be('A simple sample.')
        })
    })
})
