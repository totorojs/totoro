![totoro - 前端质量保证工具集](https://f.cloud.github.com/assets/340282/401517/4563cedc-a8dd-11e2-814d-36494351adfa.jpg)

# totoro

简单、易用和稳定的前端单元测试工具。

最新版本：v0.1.6 [Change Log](https://github.com/totorojs/totoro/wiki/change-log)

[English Documentation](README.en.md)

---

## 0. 特性

- 在真实的浏览器中运行
- 支持所有的测试框架
- 实时进度反馈和漂亮的测试报告
- **足够健壮，适用于生产环境**

## 1. 安装

### 从 npm 安装

    $ sudo npm install totoro -g

### 从 Github 安装

可以体验开发中的最新功能

    $ git clone git@github.com:totorojs/totoro.git
    $ cd totoro
    $ sudo npm install -g

## 2. 快速上手

简单起见，我们已经为你准备好了一个可供测试的例子：

**注意**：默认的测试服务暂时仅阿里系可用，你可以更换任何可用的测试服务，详见 “配置项” 部分。

    $ git clone git@github.com:totorojs/totoro.git
    $ cd totoro/examples/simple
    $ totoro

如无意外，你将看到如下结果：

![screen shot 2013-05-08 at 4 00 26 pm](https://f.cloud.github.com/assets/340282/476620/b326ddb6-b7c3-11e2-94b7-4828df877218.png)

- 小圆点为即时进度反馈，每个小圆点代表一个测试用例完成。成功显示为绿色，失败显示为红色。
- 测试报告中，全部通过的浏览器，会以绿色字体输出显示，其中包含测试持续时间。如果有未通过或者超时的情况，则会以红色字体显示，并输出错误详情。

## 3. 配置项

所有的配置项均为可选，通常你并不需要使用它们。

- `verbose`：显示日志。
- `runner`：指定要运行的 runner，接受相对路径和绝对路径。在你的项目目录中运行 totoro 命令，如果测试文件存放在 tests/ 或 test/ 子目录中，并且将 runner 命名为 runner.html 或 index.html，totoro 就能自动找到它。
- `adapter`：指定报告适配器。用于将运行结果从服务端发送回客户端，已内置的适配器有 mocha, jasmine。其实自己写一个也很简单，可参考 `static/adapters/mocha.js`。
- `browsers`：指定要测试的浏览器。以下为一些命令行的例子：

        os/browser/version  //标准格式
        chrome,ie  //测试 chrome 和 ie
        mac/chrome,win/firefox //测试mac下的chrome和windows下的firefox
        ie/6,ie/7,ie/8,ie/9 //测试ie6789

- `timeout`：客户端超时时间，单位为**分钟**，默认为 5。

进行测试时，客户端会启动起一个 http 服务将 runner 变成可访问的 url 地址，以下 3 个配置项均跟此 http 服务有关：

- `clientRoot`：服务的根目录，接受相对路径和绝对路径。totoro 会检查 runner 中的相对引用以猜测根目录。
- `clientHost`：默认为本机 ip。
- `clientPort`：默认为 9998。

指定测试服务：

- `serverHost`：服务端host，已提供一个默认服务的 host。
- `srrverPort`：服务端port，默认为 9999。

## 4. 配置文件

你可以通过 3 种方式指定上述配置项：命令行参数，totoro-config.json 和全局配置。这 3 种配置方式优先级依次降低。其中：

- totoro-config.json 必须位于 totoro 命令运行时所在的目录。
- 全局配置文件位于 ~/.totoro/config.json。仅支持配置 serverHost 和 serverPort。


## 5. 关于

totoro 的名字来自于宫崎骏导演的奇幻动画电影《龙猫》。