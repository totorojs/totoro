define(function(require) {
    var expect = require('expect')
    var simple = require('simple')

    console.log('Totoro supports all testing frameworks, all you need is a custom adapter.')
    console.log('This test use "tests/totoro-adapters.js" as adapter automatically.')

    describe('A Test Suite', function() {
        it('A Test Case', function() {
            expect(simple()).to.be('A simple sample.')
        })
    })
})
