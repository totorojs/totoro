# totoro-test

**支付宝前端测试方案**

totoro-test 是一个可以把模块中的测试用例，发送到不同的浏览器上执行，并收集相应的测试结果的一个程序。*目前我们所有的测试都是针对 cmd 模块*

## 安装
```
npm install totoro -g
```
安装完成后

```
totoro --verson
```
能够现实出正确的信息，说明已经安装成功，目前最新的版本是 0.0.5

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

#### 注意事项（v0.0.5）
1. 只支持标准的 cmd 模块，具体的模块样本可以参考 [arale](http://aralejs.org) 相关模块
2. 只支持 [mocha](https://github.com/totorojs/totoro-test/blob/master/docs/test-frames/mocha.md) 测试套件。其中如果使用到 expect 需要在测试用例中 `require('expect)`
3. 目前模块中单元测试用例需要在 **test** 或 **tests** 目录中
4. 目前测试用例 totoro 只能识别 _*-spec.js__ 和 __*-test.js__ 这两种形式的测试文件.
5. 执行完 totoro 命令后会在 tests 目录中会自动生成一个 runner.html. 这个是为了加载测试用例，生成的页面。这个不需要添加到版本控制中。
  

### 指定测试页
如果我们的模块已经有了一个可以运行的测试页，我我们可以通过下面的命令 totoro 就会自动把你的测试页面在指定的刘浏览器中运行，并返回测试结果.

```
totoro test -r _site/tests/runner.html
```

#### 使用演示
我们还是拿我们 arale 的一个模块来举例

* 检出模块

```
git clone git@github.com:aralejs/overlay.git
```
* 进入到 overlay 执行

```
make build-doc
```
其中这里用到了 nico. 如果不知道 nico 可参看 [nico 快速安装](http://aralejs.org/docs/develop-components.html#nico)

正确的执行上命令后就会产生一个 _site 目录，里面包含了相关测试和文档等内容

* 然后我们就可以执行

```
totoro test -r _site/tests/runner.html
```
然后我们也会看到和上面运行类似的结果了。

#### 注意事项(v0.0.5)
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

