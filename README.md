# TOTORO-TEST

**支付宝前端测试方案**

totoro-test 是一个可以把模块中的测试用例，发送到不同的浏览器上执行，并收集相应的测试结果的一个程序.

**目前我们所有的测试都是针对 cmd 模块**

## 安装
```
npm install totoro -g
```
安装完成后

```
totoro --verson
```
能够现实出正确的信息，说明已经安装成功，目前最新的版本是 0.0.6

## 使用
**主要有两种使用方式**

### 标准方式
直接进入模块的目录执行下面命令即可. 

```
totoro test
```

#### 使用演示
下面是一个真实的例子，大家可以按照下面的步骤来体会整个执行流程

* 检出模块代码

```
git clone https://github.com/aralejs/base.git
```
* 进入到 base 目录中,执行

```
totoro test
```
* 然后就会看到下面类似的结果

```
Firefox 19.0.0 (Windows 7) PASSED 20 tests
IE 7.0.0 (Windows XP) PASSED 20 tests
IE 8.0.0 (Windows 7) PASSED 20 tests
Chrome 25.0.1364 (Windows 7) PASSED 20 tests
IE 9.0.0 (Windows 7) PASSED 20 tests
IE 6.0.0 (Windows XP) PASSED 20 tests
Opera 12.14.0 (Windows XP) PASSED 20 tests
Safari 5.1.7 (Windows 7) PASSED 20 tests
PASSED on all browsers
```

看到上面的内容就说明你已经会使用 totoro 了，是不是很简单。

#### 注意事项（v0.0.6）
1. 只支持标准的 cmd 模块，具体的模块样本可以参考 [arale](http://aralejs.org) 相关模块
2. 只支持 [mocha](https://github.com/totorojs/totoro-test/blob/master/docs/test-frames/mocha.md) 测试套件。其中如果使用到 expect 需要在测试用例中 `require('expect)`
3. 目前模块中单元测试用例需要在 **test** 或 **tests** 目录中
4. 目前测试用例 totoro 只能识别 __*-spec.js__ 和 __*-test.js__ 这两种形式的测试文件.

### 指定测试页
如果我们的模块已经有了一个可以运行的测试页，我我们可以通过下面的命令 totoro 就会自动把你的测试页面在指定的刘浏览器中运行，并返回测试结果.

```
totoro test -r _site/tests/runner.html
```

#### 注意事项(v0.0.6)
1. 我们目前支持下面集中测试套件:
    * mocha
    * jasmine
    * quint
    * yuitest
2. 在测试页面中对这些测试套件的引用必须显式引用，比如:

```
    <script src='../mocha.js'></script>
```



更多文档和介绍详见 [wiki](https://github.com/totorojs/totoro-test/wiki)

