Mocha 是一个能同时在 [node](http://nodejs.org) 端和浏览器端运行的特性丰富的测试框架，它使得异步测试简单而有趣。Mocha 通过串行的方式运行测试，通过将未捕获的异常映射到正确的测试用例，它能支持灵活而精确的测试报告，。项目托管在 [GitHub](http://github.com/visionmedia/mocha)。

<h2 id="table-of-contents">目录</h2>

  - [安装](#installation)
  - [快速上手](#getting-started)
  - [断言](#assertions)
  - [同步代码](#synchronous-code)
  - [异步代码](#asynchronous-code)
  - [测试占位](#pending-tests)
  - [仅执行指定测试](#exclusive-tests)
  - [忽略指定测试](#inclusive-tests)
  - [测试持续时间](#test-duration)
  - [字符串差异](#string-diffs)
  - [Mocha 命令行参数](#usage)
  - [接口](#interfaces)
  - [测试报告](#reporters)
  - [浏览器支持](#browser-support)
  - [mocha 选项](#mocha.opts)
  - [套件指定超时时长](#suite-specific-timeouts)
  - [测试指定超时时长](#test-specific-timeouts)
  - [最佳实践](#best-practices)
  - [编辑器](#editors)
  - [测试套件范例](#example-test-suites)
  - [运行 mocha 测试](#running-mochas-tests)
  - [更多信息](#more-information)

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
      -r, --require <name>            require the given module
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

  coffee-script is no longer supported out of the box. CS and similar transpilers
  may be used by mapping the file extensions (for use with --watch) and the module
  name. For example `--compilers coffee:coffee-script`.

<h3 id="bail-option">-b, --bail</h3>

  Only interested in the first exception? use `--bail` !

<h3 id="debug-option">-d, --debug</h3>

  Enables node's debugger support, this executes your script(s) with `node debug <file ...>` allowing you to step through code and break with the __debugger__ statement.

<h3 id="globals-option">--globals &lt;names&gt;</h3>

  Accepts a comma-delimited list of accepted global variable names. For example suppose your app deliberately exposes a global named `app` and `YUI`, you may want to add `--globals app,YUI`.

<h3 id="ignore-leaks-option">--ignore-leaks</h3>

  By default Mocha will fail when global variables are introduced, you may use `--globals` to specify a few, or use `--ignore-leaks` to disable this functionality. 

<h3 id="require-option">-r, --require &lt;name&gt;</h3>

  The `--require` option is useful for libraries such as [should.js](http://github.com/visionmedia/should.js), so you may simply `--require should` instead of manually invoking `require('should')` within each test file. Note that this works well for `should` as it augments `Object.prototype`, however if you wish to access a module's exports you will have to require them, for example `var should = require('should')`.

<h3 id="ui-option">-u, --ui &lt;name&gt;</h3>

  The `--ui` option lets you specify the interface to use, defaulting to "bdd".
  
<h3 id="reporter-option">-R, --reporter &lt;name&gt;</h3>

  The `--reporter` option allows you to specify the reporter that will be used, defaulting to "dot". This flag may also be used to utilize third-party reporters. For example if you `npm install mocha-lcov-reporter` you may then do `--reporter mocha-lcov-reporter`.
  
<h3 id="timeout-option">-t, --timeout &lt;ms&gt;</h3>

  Specifies the test-case timeout, defaulting to 2 seconds. To override you may pass the timeout in milliseconds, or a value with the `s` suffix, ex: `--timeout 2s` or `--timeout 2000` would be equivalent.

<h3 id="slow-option">-s, --slow &lt;ms&gt;</h3>

  Specify the "slow" test threshold, defaulting to 75ms. Mocha uses this to highlight test-cases that are taking too long.

<h3 id="grep-option">-g, --grep &lt;pattern&gt;</h3>

  The `--grep` option when specified will trigger mocha to only run tests matching the given `pattern` which is internally compiled to a `RegExp`. 
  
  Suppose for example you have "api" related tests, as well as "app" related tests, as shown in the following snippet; One could use `--grep api` or `--grep app` to run one or the other. The same goes for any other part of a suite or test-case title, `--grep users` would be valid as well, or even `--grep GET`.

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

<h2 id="interfaces">Interfaces</h2>

  Mocha "interface" system allows developers to choose their style of DSL. Shipping with __BDD__, __TDD__, and __exports__ flavoured interfaces.

<h3 id="bdd-interface">BDD</h3>

  The "__BDD__" interface provides `describe()`, `it()`, `before()`, `after()`, `beforeEach()`, and `afterEach()`: 

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

  The "__TDD__" interface provides `suite()`, `test()`, `setup()`, and `teardown()`.

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

  The "__exports__" interface is much like Mocha's predecessor [expresso](http://github.com/visionmedia/expresso). The keys `before`, `after`, `beforeEach`, and `afterEach` are special-cased, object values
  are suites, and function values are test-cases.

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

  The qunit-inspired interface matches the "flat" look of QUnit where the test suite title is simply defined before the test-cases.
  
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

<h2 id="reporters">Reporters</h2>

  Mocha reporters adjust to the terminal window,
  and always disable ansi-escape colouring when
  the stdio streams are not associated with a tty.

<h3 id="dot-matrix-reporter">Dot Matrix</h3>

  The "dot" matrix reporter is simply a series of dots
  that represent test cases, failures highlight in red,
  pending in blue, slow as yellow.

   ![dot matrix reporter](images/reporter-dot.png)

<h3 id="spec-reporter">Spec</h3>

  The "spec" reporter outputs a hierarchical view
  nested just as the test cases are.

   ![spec reporter](images/reporter-spec.png)
   ![spec reporter with failure](images/reporter-spec-fail.png)

<h3 id="nyan-reporter">Nyan</h3>

  The "nyan" reporter is exactly what you might expect:
  
  ![js nyan cat reporter](http://f.cl.ly/items/3f1P1d2U1y1E0K1W1M0m/Screen%20Shot%202012-08-22%20at%203.59.08%20PM.png)

<h3 id="tap-reporter">TAP</h3>

  The TAP reporter emits lines for a [Test-Anything-Protocol](http://en.wikipedia.org/wiki/Test_Anything_Protocol) consumer.

  ![test anything protocol](images/reporter-tap.png)

<h3 id="landing-strip-reporter">Landing Strip</h3>

  The Landing Strip reporter is a gimmicky test reporter simulating
  a plane landing :) unicode ftw

  ![landing strip plane reporter](images/reporter-landing.png)
  ![landing strip with failure](images/reporter-landing-fail.png)

<h3 id="list-reporter">List</h3>

  The "List" reporter outputs a simple specifications list as
  test cases pass or fail, outputting the failure details at 
  the bottom of the output.

  ![list reporter](images/reporter-list.png)

<h3 id="progress-reporter">Progress</h3>

  The progress reporter implements a simple progress-bar:

  ![progress bar](images/reporter-progress.png)

<h3 id="json-reporter">JSON</h3>

  The JSON reporter outputs a single large JSON object when
  the tests have completed (failures or not).
  
  ![json reporter](images/reporter-json.png)

<h3 id="json-stream-reporter">JSON Stream</h3>

  The JSON Stream reporter outputs newline-delimited JSON "events" as they occur, beginning with a "start" event, followed by test passes or failures, and then the final "end" event.

  ![json stream reporter](images/reporter-json-stream.png)

<h3 id="jsoncov-reporter">JSONCov</h3>

  The JSONCov reporter is similar to the JSON reporter, however when run against a library instrumented by [node-jscoverage](https://github.com/visionmedia/node-jscoverage) it will produce coverage output.

<h3 id="htmlcov-reporter">HTMLCov</h3>

  The HTMLCov reporter extends the JSONCov reporter. The library being tested should first be instrumented by [node-jscoverage](https://github.com/visionmedia/node-jscoverage), this allows Mocha to capture the coverage information necessary to produce a single-page HTML report.

  Click to view the current [Express test coverage](coverage.html) report. For an integration example view the mcoha test coverage support [commit](https://github.com/visionmedia/express/commit/b6ee5fafd0d6c79cf7df5560cb324ebee4fe3a7f) for Express.

  ![code coverage reporting](http://f.cl.ly/items/3T3G1h1d3Z2i3M3Y1Y0Y/Screen%20Shot%202012-02-23%20at%208.37.13%20PM.png)

<h3 id="min-reporter">Min</h3>

  The "min" reporter displays the summary only, while still outputting errors
  on failure. This reporter works great with `--watch` as it clears the terminal
  in order to keep your test summary at the top.
  
  ![](http://f.cl.ly/items/460B2r3p3M3k2D3J250m/Screen%20Shot%202012-03-24%20at%2010.46.01%20AM.png)

<h3 id="doc-reporter">Doc</h3>

 The "doc" reporter outputs a hierarchical HTML body representation
 of your tests, wrap it with a header, footer, some styling and you
 have some fantastic documentation!

  ![doc reporter](images/reporter-doc.png)

 For example suppose you have the following JavaScript:

    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
          [1,2,3].indexOf(5).should.equal(-1);
          [1,2,3].indexOf(0).should.equal(-1);
        })
      })
    })

 The command `mocha --reporter doc array` would yield:

    <section class="suite">
      <h1>Array</h1>
      <dl>
        <section class="suite">
          <h1>#indexOf()</h1>
          <dl>
          <dt>should return -1 when the value is not present</dt>
          <dd><pre><code>[1,2,3].indexOf(5).should.equal(-1);
    [1,2,3].indexOf(0).should.equal(-1);</code></pre></dd>
          </dl>
        </section>
      </dl>
    </section>

  The SuperAgent request library [test documentation](http://visionmedia.github.com/superagent/docs/test.html) was generated with Mocha's doc reporter using this simple make target:
  
    test-docs:
        make test REPORTER=doc \
            | cat docs/head.html - docs/tail.html \
            > docs/test.html

  View the entire [Makefile](https://github.com/visionmedia/superagent/blob/master/Makefile) for reference.

<h3 id="xunit-reporter">XUnit</h3>

   Documentation needed.

<h3 id="teamcity-reporter">TeamCity</h3>

   Documentation needed.

<h3 id="markdown-reporter">Markdown</h3>

  The "markdown" reporter generates a markdown TOC and body for your
  test suite. This is great if you want to use the tests as documentation
  within a Github wiki page, or a markdown file in the repository that
  Github can render. For example here is the Connect [test output](https://github.com/senchalabs/connect/blob/90a725343c2945aaee637e799b1cd11e065b2bff/tests.md).

<h3 id="html-reporter">HTML</h3>

 The __HTML__ reporter is currently the only browser reporter
 supported by Mocha, and it looks like this:
 
 ![HTML test reporter](images/reporter-html.png)

<h2 id="browser-support">Browser support</h2>

 Mocha runs in the browser. Every release of Mocha will have new builds of _./mocha.js_ and _./mocha.css_ for use in the browser. To setup Mocha for browser use all you have to do is include the script, stylesheet, tell Mocha which interface you wish to use, and then run the tests. A typical setup might look something like the following, where we call `mocha.setup('bdd')` to use the __BDD__ interface before loading the test scripts, running them `onload` with `mocha.run()`.

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

  The client-side may utilize `--grep` as well, however you use the query-string, for example `?grep=api`.

<h2 id="mocha.opts">mocha.opts</h2>

 Mocha will attempt to load `./test/mocha.opts`, these are concatenated with `process.argv`, though command-line args will take precedence. For example suppose you have the following _mocha.opts_ file:

    --require should
    --reporter dot
    --ui bdd

  This will default the reporter to `dot`, require the `should` library,
  and use `bdd` as the interface. With this you may then invoke `mocha(1)`
  with additional arguments, here enabling growl support and changing
  the reporter to `spec`:

    $ mocha --reporter list --growl

<h2 id="suite-specific-timeouts">Suite specific timeouts</h2>

  Suite-level timeouts may be applied to entire test "suites", or disabled
  via `this.timeout(0)`. This will be inherited by all nested suites and test-cases
  that do not override the value.

    describe('a suite of tests', function(){
      this.timeout(500);

      it('should take less than 500ms', function(done){
        setTimeout(done, 300);
      })

      it('should take less than 500ms as well', function(done){
        setTimeout(done, 200);
      })
    })


<h2 id="test-specific-timeouts">Test specific timeouts</h2>

  Test-specific timeouts may also be applied, or the use of `this.timeout(0)`
  to disable timeouts all together:

    it('should take less than 500ms', function(done){
      this.timeout(500);
      setTimeout(done, 300);
    })

<h2 id="best-practices">Best practices</h2>

<h3 id="test-directory">test/*</h3>

 By default `mocha(1)` will use the pattern `./test/*.js`, so
 it's usually a good place to put your tests.

<h3 id="makefiles">Makefiles</h3>

 Be kind and don't make developers hunt around in your docs to figure
 out how to run the tests, add a `make test` target to your _Makefile_:

     test:
       ./node_modules/.bin/mocha \
         --reporter list
     
     .PHONY: test

<h2 id="editors">Editors</h2>

  The following editor-related packages are available:

<h3 id="textmate-bundle">TextMate bundle</h3>

  The Mocha TextMate bundle includes snippets to
  make writing tests quicker and more enjoyable.
  To install the bundle run:

      $ make tm

<h2 id="example-test-suites">Example test suites</h2>

  The following test suites are from real projects putting Mocha to use,
  so they serve as good examples:
  
   - [Express](https://github.com/visionmedia/express/tree/master/test)
   - [Connect](https://github.com/senchalabs/connect/tree/master/test)
   - [SuperAgent](https://github.com/visionmedia/superagent/tree/master/test/node)
   - [WebSocket.io](https://github.com/LearnBoost/websocket.io/tree/master/test)
   - [Mocha](https://github.com/visionmedia/mocha/tree/master/test)

<h2 id="running-mochas-tests">Running mocha's tests</h2>

 Run the tests:

       $ make test

 Run all tests, including interfaces:

       $ make test-all

 Alter the reporter:

       $ make test REPORTER=list

<h2 id="more-information">More information</h2>

  For additional information such as using spies, mocking, and shared behaviours be sure to check out the [Mocha Wiki](https://github.com/visionmedia/mocha/wiki) on GitHub. For discussions join the [Google Group](http://groups.google.com/group/mochajs). For a running example of mocha view [example/tests.html](example/tests.html).