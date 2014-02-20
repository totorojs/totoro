define(function(require) {
    var expect = require('expect')

    console.log('This test has a test case needs to run 10 seconds.')

    describe('A Test Suite', function() {
        this.timeout(30000)
        it('A Test Case', function(done) {
            setTimeout(function() {
                expect('1').to.eql(1)
                done()
            }, 10000)
        })
    })
})
