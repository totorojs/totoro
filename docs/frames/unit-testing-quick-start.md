# 快速上手单元测试

本文希望在半个小时内指引你快速上手单元测试，并且提供了一些必要的扩展参考链接。

**目录**

1. 什么时候我们需要单元测试？
2. 一些基本概念
3. 编写单元测试
4. 运行单元测试
    1. 手工运行测试
    2. 自动运行测试

## 什么时候我们需要单元测试？

显然不是所有的项目都需要单元测试，有些业务变更频繁，就没必要写；有些项目上线时间非常赶，那么也可以发布以后再慢慢补全。但是如果你在编写基础类库的代码，或者是非常重要的核心业务代码，那么单元测试就是必须的。

单元测试也不是所有项目一开始就要写（这和TDD不矛盾），在进行复杂项目的开发时，初期的编码经常会有较大调整来明确开发思路，这时候你完全不需要写测试，只需要编写 demo，快速验证结果即可。

总的来说，单元测试是保障代码质量的一个非常重要的方法（争论早已结束），所以在条件允许的情况下，要尽可能去写。

## 一些基本概念

- **单元测试** 
    
    针对程序的最小单位来进行正确性检验的工作。这个最小单元通常指函数或方法，是程序的最小可测试部件。
    
- **功能测试**

    根据程序的输入、输出和系统功能，从用户的角度针对软件界面、功能及外观进行的测试。
    
- **回归测试**

    根据在一个开发螺旋周期或者一个新版本的调试、维护或开发中产生的变化对程序加以测试。
     
- **持续集成**

    持续集成是一种软件开发实践，即团队开发成员经常集成他们的工作，通常每个成员每天至少集成一次，也就意味着每天可能会发生多次集成。每次集成都通过自动化的构建（包括编译，发布，自动化测试)来验证，从而尽快地发现集成错误。许多团队发现这个过程可以大大减少集成的问题，让团队能够更快的开发内聚的软件。


此外，常接触的概念还有：UI 测试、兼容性测试、性能测试、测试覆盖率等。

值得注意的是，这些概念并不同通过某个单一的维度进行划分的，所以会有重叠，例如一个方法包含 DOM 操作，就是一个包含 **UI 测试** 的单元测试，而这个单元测试文件可能要在多浏览器中运行以通过 **兼容性测试** ，也可能会通过某个系统进行 **持续集成**。

## 编写单元测试

编写单元测试是件非常容易上手的事情，以 [arale.event](https://github.com/aralejs/events) 为例:

### 目录结构

    events/
        dist/
        src/
        tests/
            events-spec.js
            runner.html
        readme.md

测试代码就放在 tests/ 文件夹中

### 测试脚本

events-spec.js

    define(function(require) {

        var Events = require('../src/events')
        var expect = require('expect')
    
        describe('Events', function() {
    
            it('on and trigger', function() {
                var obj = new Events()
                obj.counter = 0
        
                obj.on('event', function() {
                    obj.counter += 1
                })
        
                obj.trigger('event')
                expect(obj.counter).to.equal(1)
        
                obj.trigger('event')
                obj.trigger('event')
                obj.trigger('event')
                obj.trigger('event')
                expect(obj.counter).to.equal(5)
            })
            
            ...
        })
    })

解读以上代码片段，由这么几个部分组成：

- **CMD 模块**

    - 最外层的 `define(function(require){ … }` 表明这是一个 [CMD](https://github.com/seajs/seajs/issues/242) 模块。
    - `var Events = require('../src/events')` 获得我们要测试的 `Events` 模块。
    - `var expect = require('expect')` 获得我们要使用的测试断言工具 `expect` 模块。
    
- **测试套件**

    `describe('Events', function(){ it('on and trigger', fn) …}` 是一个 [测试套件](http://zh.wikipedia.org/wiki/%E6%B5%8B%E8%AF%95%E5%A5%97%E4%BB%B6)， 其中 `describe()` 把所有 `Events` 模块的测试用例集合到一起，而 `it('on and trigger', fn)` 就是其中一个[测试用例](http://zh.wikipedia.org/wiki/%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B)。
    
    测试套件我们推荐使用 [mocha](mocha.md)，文档还介绍了异步测试、指定超时以及测试用例的前置和后置处理 `before(), after(), beforeEach(), 和 afterEach()`等。
    
- **断言**

    `expect(obj.counter).to.equal(1)` 和 `expect(obj.counter).to.equal(5)` 是两句断言，即判定 'on and trigger' 测试用例是否通过的语句。
    
    断言我们推荐使用 [expect](expect.md)，文档全面介绍了各种断言的使用。

看，非常简单是不是，现在你已经能搞定一般的单元测试了。除此之外，还有什么问题我们可能会遇到呢？

- **监视、桩和仿制（spy, stub end mock）**

    可能你的代码中有用到外部库提供的 Ajax 功能，但你肯定不想还要搭建一个能真正处理 Ajax 请求的服务才能进行测试，这个时候需要有库帮你模拟这个 Ajax 请求的返回结果。
    
    又或者你希望监视某个函数是否被调用或被调用的次数。
    
    此类功能我们推荐使用 [sinon](sinon.md) 。

- **事件模拟**

    作为前端，写的代码免不了会包含各种浏览器端的操作，包括键盘、鼠标和触摸手势。我们需要触发相应的事件以确定 DOM 元素的表现是否正常或者绑定的方法是否正常工作。
    
    该项功能我们推荐使用 [event-simulate](https://github.com/aralejs/event-simulate) 。

# 运行单元测试

### 手工运行测试

**编写 runner**

runner.html

    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>Runner</title>
            <link type="text/css" rel="stylesheet" charset="utf-8" href="http://modules.spmjs.org/gallery/mocha/1.8.1/mocha.css" />
            <script src="http://modules.spmjs.org/seajs/1.3.1/sea.js"></script>
            <script src="http://modules.spmjs.org/gallery/mocha/1.8.1/mocha.js"></script>
        </head>
        <body>
            <div id="mocha"></div>
            <script>
                (function() {
                    mocha.setup('bdd');
                    
                    seajs.config({
                        preload: ['seajs/plugin-text','seajs/plugin-json'],
                        alias:{
                            "jquery":"gallery/jquery/1.7.2/jquery",
                            "$":"gallery/jquery/1.7.2/jquery",
                            "expect":"gallery/expect/0.2.0/expect.js",
                            "sinon":"gallery/sinon/1.6.0/sinon.js",
                            "event-simulate":"arale/event-simulate/1.0.0/event-simulate"}}
                    )
                    seajs.use(["./events-spec.js"], function() {
                        mocha.run()
                    })
                })();
            </script>
        </body>
    </html>


**在你需要测试的浏览器中打开运行**

你将看到如下运行结果

![Screen Shot 2013-02-05 at 4 19 38 PM](https://f.cloud.github.com/assets/340282/126681/e178b6d4-6f6c-11e2-837d-07f2c9c3abc5.png)

### 自动运行测试（实现中）

安装质量保障工具 totoro 后，无需手工编写 runner，命令行进入到 events/ 目录运行：

    totoro test

然后工具就会自动帮你生成 runner 页面，在多浏览器中运行测试并返回详细的测试结果。