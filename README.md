# TOTORO-TEST

命令行前端测试工具。

工具可以自动生成runner，发送到多个浏览器中进行测试，返回测试结果。

最新版本：v0.1.4 [Change Log](https://github.com/totorojs/totoro-test/wiki/change-log)

---

## 安装

### 从 npm 安装

```
npm install totoro-test -g

```
安装完毕后，运行

```
totoro-test --verson
```
输出 **0.1.4**，说明已经安装成功。


## 使用

### 标准方式

以 https://github.com/aralejs/base.git 为例

```
git clone https://github.com/aralejs/base.git
cd base
totoro-test
```
然后就会看到下面类似的结果

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

看到上面的内容就说明你已经会使用 totoro-test 了，是不是很简单。

#### 注意事项
1. 目前只支持 CMD 模块。
2. 测试脚本需放在 tests 或 test 文件夹中。
3. 工具可以自动生成runner.html，test/tests 文件夹中，文件名包含 __spec__ 或 __test__ 字段的均视为测试脚本。
4. 测试类库目前支持 [mocha](https://github.com/totorojs/totoro-test/wiki/mocha) 、[expect](https://github.com/totorojs/totoro-test/wiki/expect) 、 [sinon](https://github.com/totorojs/totoro-test/wiki/sinon) 和 [eventSimulate](https://github.com/aralejs/event-simulate)组合。除mocha外，其他均需要通过 `require` 引入。

### 指定 runner 进行测试

如果我们的模块已经有了一个可以运行的测试页，我我们可以通过下面的命令 totoro 就会自动把你的测试页面在指定的刘浏览器中运行，并返回测试结果.

```
totoro-test -runner _site/tests/runner.html
```

### 自定义测试适配器
```
totoro-test --adapter=tests/totoro-adapter.js
```


#### 注意事项

1. 我们目前支持 mocha 种测试套件:
2. 在测试页面中对这些测试套件的引用必须单独且不更改名称，比如:

```
    <script src='../mocha.js'></script>
```



更多文档和介绍详见 [wiki](https://github.com/totorojs/totoro-test/wiki)

