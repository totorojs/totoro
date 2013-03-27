# totoro-test

**支付宝前端测试方案**

totoro-test 可以根据模块的测试用例，生成测试页面(runner.html)，并把测试页面发送到我们的测试平台，而我们的测试平台可以在指定的浏览器中运行测试页面，并把测试结果发送到用户终端。

**目前我们所有的测试的模块都是针对 cmd 模块**

## 安装
```
npm install totoro -g
```
## 使用
**主要有两种使用方式**
### 1. 自动生成测试页
目前只支持 [mocha](https://github.com/totorojs/totoro-test/blob/master/docs/test-frames/mocha.md)测试用例的自动生成

使用方式如下：

```
totoro test
```
#### 执行流程:
1. totoro 会查找用户执行模块目录中的 **test** 或 **tests** 目录.
2. 检查找到的测试目录是否有 runner.html
3. 如果有跳转到 4
4. 在测试目录中生成 runner.html. 其中生成的 runner.html 中会内置 mocha 模块，并且会自动加载测试目录中的所有 __*-spec.js__ 和 __*-test.js__ 文件。
5. 然后 totoro 会分把 runner.html 发送到测试服务器中去执行，然后返回测试结果 
 

### 2. 指定测试页
```
totoro test -r _site/tests/runner.html
```
目前对于指定运行的 runner.html 我们目前支持下面集中测试套件:

1. mocha
2. jasmine
3. quint
4. yuitest

需要注意的是在页面中对这些测试套件的引用必须显式引用，比如:

```
    <script src='../mocha.js'></script>
```

只有这样 **totoro** 才能正确的返回测试结果.

## 注意事项

详见 [wiki](https://github.com/totorojs/totoro-test/wiki)

