define(function(require) {
    var expect = require('expect')
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
