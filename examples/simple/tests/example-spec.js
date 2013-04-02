define(function(require) {

    var $ = require('$')
    //var Class = require('class')
    require('sinon')
    var eventSimulate = require('event-simulate')

    
    describe('测试套件', function() {

        it('测试用例', function() {
            expect('断言').to.be.a('string')
        })
        
        describe('子测试套件', function() {
            it('子测试用例', function() {
                expect('子断言').to.be.a('string')
            })
        })
    })
    
    
    describe('断言', function(){
        
        it('be: 断言全等 ===', function(){
            expect(1).to.be(1)
            expect('1').not.to.be(1)
            expect(NaN).not.to.be(NaN)
            
        })
        
        it('eql: 断言相等 ==', function(){
            expect('1').to.eql(1)
            expect(1).to.eql(true)
            expect({ a: 'b' }).to.eql({ a: 'b' })
        })
        
        it('ok: 断言真值', function(){
            expect(1).to.be.ok()
            expect({}).to.be.ok()
            expect(0).not.to.be.ok()
        })
        
        it('a / an: 断言类型', function(){
            expect(5).to.be.a('number')
            expect([]).to.be.an('array')
            /*
            var Human = Class.create()
            var Coder = Class.create(Human)
            var xiaoming = new Coder()
            
            expect(xiaoming).to.be.a(Human)
            expect(xiaoming).to.be.a(Coder)
            */
        })
        
        it('match: 断言正则匹配', function(){
            expect('0.1.0').to.match(/[0-9]+\.[0-9]+\.[0-9]+/)
        })
    })
    
    
    describe('异步方法', function(){
        function async(cb){
            setTimeout(function(){
                cb(true)
            },10)
        }
        
        it('返回 true', function(done){
            async(function(args){
                expect(args).to.be.ok()
                done()
            })
        })
    })
    
    
    describe('预备和清理', function(){
        before(function(){
            $('<div id="div1" style="width:100px;height:100px;">').appendTo(document.body)
        })
        
        it('元素id为 div1', function(){
            expect($('#div1').attr('id')).to.be('div1')
        })
        
        it('元素尺寸为 100x100', function(){
            expect($('#div1').css('width')).to.be('100px')
            expect($('#div1').css('height')).to.be('100px')
        })
        
        after(function(){
            $('#div1').remove()
        })
    })
    
    
    describe('DOM 操作和事件模拟', function(){
        var trigger
        var popup
        var fn
        before(function(){
            popup = $('<div style="display:none;width:100px;height:100px;background:#ccc;">').
                appendTo(document.body)
            fn = function(ev){popup.css('display', 'block')}
            trigger = $('<div>click me</div>')
                .appendTo(document.body)
                .on('click', fn)
        })
        it('点击触发 popup', function(){
            expect(popup.css('display')).to.be('none')
            eventSimulate.simulate(trigger, 'click')
            expect(popup.css('display')).to.be('block')
        })
        after(function(){
            trigger.off('click', fn)
            trigger.remove()
            popup.remove()
        })
    })
    
    
    describe('spy', function(){
        var jq = {ajax: function(args){}}
        function log(n, v){
            jq.ajax({
                url:'someurl',
                method:'get',
                data:'n='+n+'&v='+v,
                callback: null
            })
        }
        before(function(){
            sinon.spy(jq, 'ajax')
            // sinon.spy(methodName)
        })
        it('log 方法会调用 jq.ajax 方法', function(){
            log('tti', 200)
            expect(jq.ajax.calledOnce).to.be.ok()
            log('tti', 135)
            expect(jq.ajax.calledTwice).to.be.ok()
            
            var call = jq.ajax.getCall(1)
            var callArgs = call.args
            expect(call.args[0].data).to.be('n=tti&v=135')
            
        })
        after(function(){
            jq.ajax.restore()
        })
    })
    
    
    describe('stub', function(){
        var jq = {ajax: function(args){}}
        before(function(){
            sinon.stub(jq, 'ajax')
            jq.ajax.yieldsTo('callback', 'success!')
        })
        it('控制 jq.ajax 的回调参数', function(done){
            jq.ajax({
                callback:function(args){
                    expect(args).to.be('success!')
                    done()
                }
            })
        })
        after(function(){
            jq.ajax.restore()
        })
    })
    
    
    describe('性能测试', function(){
        function fn(){
            for(var i = 0; i<10000; i++){
                var a
            }
        }
        
        it('脚本执行效率', function(){
            var startTime = new Date().getTime()
            for(var j=0; j<10000; j++){
                fn()
            }
            var endTime = new Date().getTime()
            expect(endTime-startTime).to.be.lessThan(250)
        })
        
    })
  











 

});
