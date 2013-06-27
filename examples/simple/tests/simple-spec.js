define(function(require) {
    var expect = require('expect')
    var simple = require('simple')

    describe('A Test Suite', function() {
        it('A Test Case', function() {
            expect(simple()).to.be('A simple sample.')
        })

        if (navigator.userAgent.indexOf('Chrome') !== -1) {
            throw new Error()
        }

        it('Another Test Case', function() {
            if (navigator.userAgent.indexOf('Safari') !== -1) {
                expect(1).to.be(3)
            }

        })
    })
})
