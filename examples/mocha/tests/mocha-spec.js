define(function(require) {

    var $ = require('$')
    var expect = require('expect')
    var sinon = require('sinon')
    var eventSimulate = require('event-simulate')

    describe('Test Suit', function() {

        it.skip('Test Unit', function() {
            expect('assertion').to.be.a('string')
        })

        describe('Sub Test Suit', function() {
            it('Sub Test Unit', function() {
                expect('sub assertion').to.be.a('string')
            })
        })
    })

    describe('Assertion', function() {

        it('be', function() {
            expect(1).to.be(1)
            expect('1').not.to.be(1)
            expect(NaN).not.to.be(NaN)
        })

        it('eql', function() {
            expect('1').to.eql(1)
            expect(1).to.eql(true)
            expect({
                a : 'b'
            }).to.eql({
                a : 'b'
            })
        })

        it('ok', function() {
            expect(1).to.be.ok()
            expect({}).to.be.ok()
            expect(0).not.to.be.ok()
        })

        it('a / an', function() {
            expect(5).to.be.a('number')
            expect([]).to.be.an('array')
        })

        it('match', function() {
            expect('0.1.0').to.match(/[0-9]+\.[0-9]+\.[0-9]+/)
        })
    })

    describe('Async Method', function() {

        function async(cb) {
            setTimeout(function() {
                cb(true)
            }, 10)
        }

        it('async assertion', function(done) {
            async(function(args) {
                expect(args).to.be.ok()
                done()
            })
        })
    })

    describe('Before and After', function() {

        before(function() {
            $('<div id="div1" style="width:100px;height:100px;">').appendTo(document.body)
        })

        it('element\'s id is div1', function() {
            expect($('#div1').attr('id')).to.be('div1')
        })

        it('element\'s dimension is 100x100', function() {
            expect($('#div1').css('width')).to.be('100px')
            expect($('#div1').css('height')).to.be('100px')
        })

        after(function() {
            $('#div1').remove()
        })
    })

    describe('DOM Operation', function() {

        var trigger
        var popup
        var fn

        before(function() {
            popup = $('<div style="display:none;width:100px;height:100px;background:#ccc;">').
                    appendTo(document.body)
            fn = function(ev) {
                popup.css('display', 'block')
            }
            trigger = $('<div>click me</div>').appendTo(document.body).on('click', fn)
        })

        it('click trigger popup', function() {
            expect(popup.css('display')).to.be('none')
            eventSimulate.simulate(trigger, 'click')
            expect(popup.css('display')).to.be('block')
        })

        after(function() {
            trigger.off('click', fn)
            trigger.remove()
            popup.remove()
        })
    })

    describe('Spy', function() {

        var jq = {
            ajax : function(args) {
            }
        }

        function log(n, v) {
            jq.ajax({
                url : 'someurl',
                method : 'get',
                data : 'n=' + n + '&v=' + v,
                callback : null
            })
        }

        before(function() {
            sinon.spy(jq, 'ajax')
        })

        it('log call jq.ajax method', function() {
            log('tti', 200)
            expect(jq.ajax.calledOnce).to.be.ok()
            log('tti', 135)
            expect(jq.ajax.calledTwice).to.be.ok()

            var call = jq.ajax.getCall(1)
            var callArgs = call.args
            expect(call.args[0].data).to.be('n=tti&v=135')

        })

        after(function() {
            jq.ajax.restore()
        })
    })

    describe('Stub', function() {

        var jq = {
            ajax : function(args) {
            }
        }

        before(function() {
            sinon.stub(jq, 'ajax')
            jq.ajax.yieldsTo('callback', 'success!')
        })

        it('control jq.ajax\'s callback', function(done) {
            jq.ajax({
                callback : function(args) {
                    expect(args).to.be('success!')
                    done()
                }
            })
        })

        after(function() {
            jq.ajax.restore()
        })
    })

    describe.skip('Performance Testing', function() {

        function fn() {
            for (var i = 0; i < 10000; i++) {
                var a
            }
        }

        it('performance', function() {
            var startTime = new Date().getTime()
            for (var j = 0; j < 10000; j++) {
                fn()
            }
            var endTime = new Date().getTime()
            expect(endTime - startTime).to.be.lessThan(250)
        })
    })
});
