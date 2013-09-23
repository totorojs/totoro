define(function(require) {
    var expect = require('expect')
    var simple = require('simple')

    describe('A Test Suite', function() {
        this.timeout(300000)
        it('A Test Case', function(done) {
            setTimeout(function() {
                expect(simple()).to.be('A simple sample.')
                done()
            }, 100000)
        })
    })
})
