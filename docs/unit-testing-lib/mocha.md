Mocha 是一个能同时在 [node](http://nodejs.org) 端和浏览器端运行的特性丰富的测试框架，它使得异步测试简单而有趣。Mocha 通过串行的方式运行测试，通过将未捕获的异常映射到正确的测试用例，它能支持灵活而精确的测试报告，。项目托管在 [GitHub](http://github.com/visionmedia/mocha)。

<h2 id="installation">安装</h2>

  通过 [npm](http://npmjs.org) 安装:

    $ npm install -g mocha

<h2 id="getting-started">快速上手</h2>

    $ npm install -g mocha
    $ mkdir test
    $ $EDITOR test/test.js

    var assert = require("assert")
    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
          assert.equal(-1, [1,2,3].indexOf(5));
          assert.equal(-1, [1,2,3].indexOf(0));
        })
      })
    })

    $  mocha

      .

      ✔ 1 test complete (1ms)


<h2 id="assertions">断言</h2>

Mocha 允许你使用任何自己喜欢的断言类库，只要它能抛错，就能工作良好。这意味着你可以使用像 [should.js](http://github.com/visionmedia/ should.js) 这样的库，一个 node 端的正则断言工具，也可以选择其它的。以下列表列出了一些比较流行的 node 或 浏览器端的断言库。

  - [should.js](http://github.com/visionmedia/should.js) BDD style shown throughout these docs
  - [expect.js](https://github.com/LearnBoost/expect.js) expect() style assertions
  - [chai](http://chaijs.com/) expect(), assert() and should style assertions
  - [better-assert](https://github.com/visionmedia/better-assert) c-style self-documenting assert()

<h2 id="synchronous-code">同步代码</h2>

当测试同步代码时，你可以忽略回调函数（it 方法中传入的第二个函数中接收的唯一一个参数），Mocha 将自动按顺序执行下一个测试

    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
          [1,2,3].indexOf(5).should.equal(-1);
          [1,2,3].indexOf(0).should.equal(-1);
        })
      })
    })

<h2 id="asynchronous-code">异步代码</h2>

当测试异步代码时，再也没有比 Mocha 更简单的了！当你的测试完成时，只要调用回调函数即可。为 `it()` 方法添加一个回调（通常命名为 `done` ），Mocha 就会知道需要等待这个异步代码执行完毕。

    describe('User', function(){
      describe('#save()', function(){
        it('should save without error', function(done){
          var user = new User('Luna');
          user.save(function(err){
            if (err) throw err;
            done();
          });
        })
      })
    })

更简单的是， `done()` 回调函数能接收错误，所以我们可以直接使用它：
To make things even easier, the `done()` callback accepts an error, so we may use this directly:

    describe('User', function(){
      describe('#save()', function(){
        it('should save without error', function(done){
          var user = new User('Luna');
          user.save(done);
        })
      })
    })

所有像 `before()`, `after()`, `beforeEach()`, `afterEach()` 这样的钩子，无论是同步还是异步的，都表现的很像一个常规的测试用例。例如，在每个测试运行之前，你可能都希望往数据库填充一些数据：
  
    describe('Connection', function(){
      var db = new Connection
        , tobi = new User('tobi')
        , loki = new User('loki')
        , jane = new User('jane');

      beforeEach(function(done){
        db.clear(function(err){
          if (err) return done(err);
          db.save([tobi, loki, jane], done);
        });
      })

      describe('#find()', function(){
        it('respond with matching records', function(done){
          db.find({ type: 'User' }, function(err, res){
            if (err) return done(err);
            res.should.have.length(3);
            done();
          })
        })
      })
    })

你可以为任何测试文件添加顶级的钩子，例如你在 `describe()` 之外添加了一个 `beforeEach()` 方法，那么这个文件中的所有测试用例运行之前，都会先运行这个方法。这是因为 Mocha 的顶级测试套件是匿名的。

    beforeEach(function(){
      console.log('before every test')
    })

<h2 id="pending-tests">测试占位</h2>

测试用例占位只要添加一个没有回调的 `it()` 方法即可：

    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present')
      })
    })

<h2 id="exclusive-tests">仅执行指定测试</h2>

仅执行指定测试的特性可以让你通过添加 `.only()` 来指定唯一要执行的测试套件或测试用例：

    describe('Array', function(){
      describe.only('#indexOf()', function(){
        ...
      })
    })

或一个指定的测试用例：

    describe('Array', function(){
      describe('#indexOf()', function(){
        it.only('should return -1 unless present', function(){
          
        })

        it('should return the index when present', function(){
          
        })
      })
    })

注意只出现一个 `.only()`，
  
  Note that currently only one `.only()` call is respected, this
  effectively turns into a `--grep`.

<h2 id="inclusive-tests">忽略指定测试</h2>

该特性和 `.only()` 非常相似，通过添加 `.skip()` 你可以告诉 Mocha 忽略的测试套件或者测试用例（可以有多个）。该操作使得这些操作处于挂起的状态，这比使用注释来的要好，因为你可能会忘记把注释给取消掉。

    describe('Array', function(){
      describe.skip('#indexOf()', function(){
        ...
      })
    })

或一个指定的测试用例：

    describe('Array', function(){
      describe('#indexOf()', function(){
        it.skip('should return -1 unless present', function(){
          
        })

        it('should return the index when present', function(){
          
        })
      })
    })

<h2 id="test-duration">测试持续时间</h2>

大多数的测试报告都会以某种形式支持显示测试持续时间，包括标记运行特别慢的测试，以下为一个 “spec” 报告：

   ![test duration](http://visionmedia.github.com/mocha/images/reporter-spec-duration.png)

<h2 id="string-diffs">字符串差异</h2>

输出测试报告时，Mocha 会显示期望值和实际值。目前 Mocha 仅提供字符串的差异比较，将来应该会支持对象和更多类型的差异比较。

  ![string diffs](http://f.cl.ly/items/3L0T1A0h2N1J3G021i0F/Screen%20Shot%202012-03-01%20at%202.31.31%20PM.png)

<h2 id="usage">Mocha 命令行参数</h2>


    Usage: mocha [debug] [options] [files]

    Commands:

      init <path>                     在指定 <path> 位置初始化一个 mocha 客户端

    Options:

      -h, --help                      输出帮助信息
      -V, --version                   输出版本号
      -r, --require <name>            必须的给定模块
      -R, --reporter <name>           指定测试报告工具
      -u, --ui <name>                 指定编写的测试用例使用的接口 (bdd|tdd|exports)
      -g, --grep <pattern>            仅运行匹配 <pattern> 的测试
      -i, --invert                    反转 --grep 的匹配
      -t, --timeout <ms>              设置测试用例的超时时间，默认为 [2000] 毫秒
      -s, --slow <ms>                 设置运行得 "慢" 的测试的阈值，默认为 [75] 毫秒
      -w, --watch                     实时监控文件修改
      -c, --colors                    启用彩色显示
      -C, --no-colors                 禁用彩色显示
      -G, --growl                     启用 growl 消息通知
      -d, --debug                     启用 node 的调试功能, 和 node --debug 一样
      -b, --bail                      bail after first test failure
      --recursive                     包括所有子目录
      --debug-brk                     在第一行启用 node 的断点调试
      --globals <names>               允许的全局变量，多个用逗号分隔
      --ignore-leaks                  忽略全局变量泄露
      --interfaces                    显示可用的接口
      --reporters                     显示可用的报告器
      --compilers <ext>:<module>,...  使用给定的模块来编译文件

<h3 id="watch-option">-w, --watch</h3>

启动以后，只要当前目录下的 js 文件有修改，就会执行测试。

<h3 id="compilers-option">--compilers</h3>

coffee-script 不再是开箱即用的支持。CS 和类似的 transpilers 可以通过映射文件扩展名和模块名来使用。例如 `--compilers coffee:coffee-script`。

<h3 id="bail-option">-b, --bail</h3>

只对第一个异常感兴趣? 那就用 `--bail` !

<h3 id="debug-option">-d, --debug</h3>

启用 node 的调试支持，通过 `node debug <file ...>` 运行脚本使你可以单步执行代码或者设置断电。

<h3 id="globals-option">--globals &lt;names&gt;</h3>

接收以逗号分隔的被允许的全局变量名。例如你的应用暴露了 `app` 和 `YUI` 两个全局变量，你可以添加参数  `--globals app,YUI`.

<h3 id="ignore-leaks-option">--ignore-leaks</h3>

默认如果 Mocha 检测到自定义的全局变量测试就会失败，你可以使用 `--globals` 指定允许使用的全局变量，或者使用 `--ignore-leaks` 来禁用该功能。

<h3 id="require-option">-r, --require &lt;name&gt;</h3>

`--require` 选项在需要某些库时非常有用，例如 [should.js](http://github.com/visionmedia/should.js)，所以你可以简单的使用 `--require should` 来代替在每个文件中手工引入 `require('should')`。注意，`should` 虽然对 `Object.prototype` 进行了混入，但也能工作良好。但是，当你需要访问一个模块的 exports 时，你还是需要在文件中 require 它们，例如 `var should = require('should')`。

<h3 id="ui-option">-u, --ui &lt;name&gt;</h3>

指定要使用的接口，默认是 "bdd"。
  
<h3 id="reporter-option">-R, --reporter &lt;name&gt;</h3>

指定要使用的报告器，默认为 "dot"。这个标记也可以使用第三方的报告器。例如安装 `npm install mocha-lcov-reporter` 后，你可以使用 `--reporter mocha-lcov-reporter`。
  
<h3 id="timeout-option">-t, --timeout &lt;ms&gt;</h3>

指定测试超时，默认为2秒。你可以自己指定超时时间，单位为毫秒，或者为这个数值添加一个后缀 `s`，则为秒。例如 `--timeout 2s` 和 `--timeout 2000` 是一样的。

<h3 id="slow-option">-s, --slow &lt;ms&gt;</h3>

设置运行得 "慢" 的测试的阈值，默认为 75 毫秒。Mocha 将高亮显示那些运行得慢的测试。 

<h3 id="grep-option">-g, --grep &lt;pattern&gt;</h3>

指定该选项，Mocha 将仅运行跟给定模式正则匹配的测试。

假定你有一些 "api" 相关的测试，还有一些 "app" 相关的测试，代码如下。你可以使用 `--grep api` 或 `--grep app` 来运行其中一个测试。这个匹配也作用于嵌套的套件和测试用例的标题，因此 `--grep users` 和 `--grep GET`都能工作良好。

    describe('api', function(){
      describe('GET /api/users', function(){
        it('respond with an array of users')
      })
    })
    
    describe('app', function(){
      describe('GET /users', function(){
        it('respond with an array of users')
      })
    })

<h2 id="interfaces">接口</h2>

Mocha "接口" 系统允许开发者选择自己的风格或 DSL。默认支持  __BDD__, __TDD__, 和 __exports__ 风格的接口。

<h3 id="bdd-interface">BDD</h3>

"__BDD__" 接口提供 `describe()`, `it()`, `before()`, `after()`, `beforeEach()`, 和 `afterEach()`: 

    describe('Array', function(){
      before(function(){
        // ...
      });

      describe('#indexOf()', function(){
        it('should return -1 when not present', function(){
          [1,2,3].indexOf(4).should.equal(-1);
        });
      });
    });

<h3 id="tdd-interface">TDD</h3>

"__TDD__" 接口提供 `suite()`, `test()`, `setup()`, 和 `teardown()`.

    suite('Array', function(){
      setup(function(){
        // ...
      });

      suite('#indexOf()', function(){
        test('should return -1 when not present', function(){
          assert.equal(-1, [1,2,3].indexOf(4));
        });
      });
    });

<h3 id="exports-interface">Exports</h3>

"__exports__" 接口非常像 Mocha 的前身 [expresso](http://github.com/visionmedia/expresso)。关键字 `before`, `after`, `beforeEach`, 和 `afterEach` 是特殊保留的，值为对象时是一个测试套件，为函数时则是一个测试用例。

    module.exports = {
      before: function(){
        // ...
      },

      'Array': {
        '#indexOf()': {
          'should return -1 when not present': function(){
            [1,2,3].indexOf(4).should.equal(-1);
          }
        }
      }
    };

<h3 id="qunit-interface">QUnit</h3>

使用这种接口使得测试代码看起来像 Qunit 一样是扁平的，测试套件的标题只要写在测试用例前面即可。

    function ok(expr, msg) {
      if (!expr) throw new Error(msg);
    }

    suite('Array');

    test('#length', function(){
      var arr = [1,2,3];
      ok(arr.length == 3);
    });

    test('#indexOf()', function(){
      var arr = [1,2,3];
      ok(arr.indexOf(1) == 0);
      ok(arr.indexOf(2) == 1);
      ok(arr.indexOf(3) == 2);
    });

    suite('String');

    test('#length', function(){
      ok('foo'.length == 3);
    });


<h2 id="browser-support">浏览器支持</h2>

Mocha 可以在浏览器中运行。每个 Mocha 的发布版本都有新构建的  _./mocha.js_ 和 _./mocha.css_ 可用于浏览器。
为了在浏览器中运行，你所需要做的就是引入 Mocha 的脚本和样式，告诉 Mocha 你使用的接口，然后运行测试。
一个典型的设置过程可能如下所示，在加载测试脚本前，我们调用 `mocha.setup('bdd')` 来使用 __BDD__ 接口，然后通过 `mocha.run()` 来运行测试。 

    <html>
    <head>
      <meta charset="utf-8">
      <title>Mocha Tests</title>
      <link rel="stylesheet" href="mocha.css" />
    </head>
    <body>
      <div id="mocha"></div>
      <script src="jquery.js"></script>
      <script src="expect.js"></script>
      <script src="mocha.js"></script>
      <script>mocha.setup('bdd')</script>
      <script src="test.array.js"></script>
      <script src="test.object.js"></script>
      <script src="test.xhr.js"></script>  
      <script>
        mocha.run();
      </script>
    </body>
    </html>

<h3 id="grep-query">grep</h3>

浏览器端页可以使用 `--grep` 选项，你可以通过在使用查询字符串来调用，例如 `?grep=api`。

<h2 id="mocha.opts">mocha.opts</h2>

Mocha 将尝试加载 `./test/mocha.opts`, 然后和 `process.argv` 进行合并，当然命令行参数将具有更高的优先级。例如假定你有一个如下的 _mocha.opts_ 文件：

    --require should
    --reporter dot
    --ui bdd

这将指定 `dot` 为默认的报告器，需要使用 `should` 库，使用 `bdd` 作为接口。
同时你还可以在调用 `mocha` 时附加各种参数，以下命令将启用 growl 支持，并且将报告器设置为 `spec`。

    $ mocha --reporter list --growl

<h2 id="suite-specific-timeouts">套件指定超时</h2>

套件级别的超时设置可应用于整个“测试套件”，你可以通过调用 `this.timeout(0)` 来禁用这个指定。该指定能被所有嵌套的但未覆盖该值的套件和测试用例继承。

    describe('a suite of tests', function(){
      this.timeout(500);

      it('should take less than 500ms', function(done){
        setTimeout(done, 300);
      })

      it('should take less than 500ms as well', function(done){
        setTimeout(done, 200);
      })
    })


<h2 id="test-specific-timeouts">测试指定超时</h2>

也可以单独指定测试超时，你可以通过 `this.timeout(0)` 来禁用这个指定。

    it('should take less than 500ms', function(done){
      this.timeout(500);
      setTimeout(done, 300);
    })

<h2 id="best-practices">最佳实践</h2>

<h3 id="test-directory">test/* 目录</h3>

默认 `mocha` 将查找路径匹配 `./test/*.js` 的文件执行。总是把你的测试文件放在这个文件夹是个不错的主意。

<h3 id="makefiles">Makefiles</h3>

添加一个 `make test` 目标到你的 _Makefile_ 可以使测试运行的更友好，不需要用户遍历文档以找出如何运行测试。

     test:
       ./node_modules/.bin/mocha \
         --reporter list
     
     .PHONY: test

<h2 id="editors">编辑器</h2>

  The following editor-related packages are available:

<h3 id="textmate-bundle">TextMate bundle</h3>

  The Mocha TextMate bundle includes snippets to
  make writing tests quicker and more enjoyable.
  To install the bundle run:

      $ make tm

<h2 id="example-test-suites">测试套件范例</h2>

以下测试套件是使用 Mocha 的进行测试的真实项目，所以他们是很好的例子：

   - [Express](https://github.com/visionmedia/express/tree/master/test)
   - [Connect](https://github.com/senchalabs/connect/tree/master/test)
   - [SuperAgent](https://github.com/visionmedia/superagent/tree/master/test/node)
   - [WebSocket.io](https://github.com/LearnBoost/websocket.io/tree/master/test)
   - [Mocha](https://github.com/visionmedia/mocha/tree/master/test)

<h2 id="running-mochas-tests">运行 mocha 测试</h2>

运行测试:

       $ make test

运行所有测试，包括接口:

       $ make test-all

选择报告器:

       $ make test REPORTER=list

<h2 id="more-information">更多信息</h2>

  
关注监视、桩和共享行为等知识请查看 [Mocha Wiki](https://github.com/visionmedia/mocha/wiki)。

你可以加入 [Google Group](http://groups.google.com/group/mochajs) 进行讨论。

访问 [example/tests.html](example/tests.html) 可以查看测试运行的范例。





