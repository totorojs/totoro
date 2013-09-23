define(function(require) {
    var expect = require('expect')
    var simple = require('simple')

    describe('GBK ²âÊÔÌ×¼ş', function() {
        it('A GBK ²âÊÔÓÃÀı', function() {
            expect(simple()).to.be('A simple sample.')
        })
    })
})
