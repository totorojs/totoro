![totoro - 前端质量保证工具集](https://f.cloud.github.com/assets/340282/401517/4563cedc-a8dd-11e2-814d-36494351adfa.jpg)

# totoro

简单易用、稳定的前端单元测试工具。

最新版本：v0.2.0 [Change Log](https://github.com/totorojs/totoro/wiki/change-log)

---

## 0. 特性

- 在真实的浏览器中运行
- 支持所有的测试框架
- 实时进度反馈和试报告
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

### 注意

工具默认提供的测试服务目前为阿里的内部服务，请通过 `--server-host` 和 `--server-port` 配置项更换其他可用测试服务，或 [启动自己的测试服务](https://github.com/totorojs/totoro-server)。

    $ git clone git@github.com:totorojs/totoro.git
    $ cd totoro/examples/simple
    $ totoro

如无意外，你将看到如下结果：

![screen shot 2013-05-08 at 4 00 26 pm](https://f.cloud.github.com/assets/340282/476620/b326ddb6-b7c3-11e2-94b7-4828df877218.png)

- 小圆点为即时进度反馈。成功显示为绿色圆点，失败显示为红色小叉。
- 测试报告中，成功的浏览器会以绿色字符输出显示，失败或超时的浏览器会以红色字符显示，并输出错误详情。


## 3. 命令行配置项


#### 注意

所有的配置项均为可选，除 `--server-host` 和 `--browsers` 外，其他配置项基本无需配置。

#### --verbose

显示 debug 日志。

默认：false

#### --runner

测试 runner。接受本地路径和 url 两种形式。

默认：自动查找当前目录，tests 或 test 子目录下的 runner.html 或 index.html 均可被识别。

#### --adapter

测试框架的适配器，用于发送测试报告。接受内置关键字、本地路径和 url 三种形式。

已支持的内置关键字有：`mocha`, `jasmine`。

自定义适配器写法可参考 [static/adapters/mocha.js](https://github.com/totorojs/totoro/blob/master/static/adapters/mocha.js)。

默认：如果 --runner 指定的是本地路径，则会先查看 runner 所在的位置是否有 `totoro-adapter.js`；如果没找到或者 --runner 指定的是 url 则会自动扫描 runner 的内容尝试查找匹配的内置关键字。

#### --browsers

指定要测试的浏览器，多个以逗号分隔。例如：

    chrome,firefox,safari,ie  //不指定版本
    ie/6,ie/7,ie/8,ie/9  //指定版本

默认：自动选取测试服务端可用的浏览器。

#### --timeout

客户端超时时间，单位为分钟。

默认：5

#### --list

查看测试服务端可用的浏览器。

#### --server-host

测试服务 host。

默认：阿里的内部host

#### --server-port

测试服务 port。

默认：9999

#### --client-host

测试时，如果指定的 runner 或 adapter 为本地路径，则会启动一个 http 服务将本地路径转换成可访问的 url ，以下两个配置项也跟此服务有关。

客户端服务 host。

默认：本机 ip

#### --client-port

客户端服务端口。

默认：9998

#### --client-root

客户端服务的根目录，接受相对路径和绝对路径。

默认：根据 runner 和 adapter 进行猜测。


## 4. 配置文件

除了命令行配置项，你还可以通过 totoro-config.json 和全局配置文件进行配置。

这 3 种配置方式优先级依次降低。

需要注意的是：

- 配置文件的配置项使用的是 **首字母小写的驼峰式命名**，如 `serverHost`
- totoro-config.json 必须位于 totoro 命令运行时所在的目录。
- 全局配置文件位于:
    - mac: ~/.totoro/config.json
    - win7: C:\Users\{{username}}
    - win xp: C:\Documents and Settings\{{username}}

## 5. 关于

totoro 的名字来自于宫崎骏导演的奇幻动画电影《龙猫》。