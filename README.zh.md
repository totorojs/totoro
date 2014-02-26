![totoro](https://f.cloud.github.com/assets/340282/891339/657d9018-fa54-11e2-9760-6955388fd8fc.jpg)

# totoro

简单易用、稳定的前端单元测试工具。

最新版本：v0.4.0 [Change Log](https://github.com/totorojs/totoro/wiki/change-log)

[![building status](https://travis-ci.org/totorojs/totoro.png?branch=master)](https://travis-ci.org/totorojs/totoro)

[English edition](README.md)

---

## 0. 特性

- 在真实的浏览器中运行
- 支持所有的测试框架
- 自动测试覆盖率
- **足够健壮，可用于实战**

## 1. 安装

### node 版本要求

\>= 0.10.12

### 从 npm 安装

```
$ npm install totoro
```

如果安装失败，你可能需要在命令前面加上 `sudo` 。

网速慢的国内用户可以使用下列命令安装：

```
npm install totoro --registry=http://r.cnpmjs.org
```

### 从 Github 安装

可以体验开发中的最新功能

```
$ git clone git@github.com:totorojs/totoro.git
$ cd totoro
$ sudo npm install -g
```
## 2. 快速上手

简单起见，我们已经为你准备好了一个可供测试的例子：

### 注意：测试前请先指定测试服务

```
$ totoro config --host={{totoroServerHost}}
```

默认为阿里巴巴集团的内部测试服务，你也可以 [启动自己的测试服务](https://github.com/totorojs/totoro-server)。

```
$ git clone git@github.com:totorojs/totoro.git
$ cd totoro/examples/simple
$ totoro
```

如无意外，你将看到如下结果：

![totoro-result](https://f.cloud.github.com/assets/340282/891944/7c099544-fa71-11e2-828b-5da8c0566834.png)

- 小圆点为即时进度反馈。成功显示为绿色圆点，失败显示为红色小叉。
- 单个浏览器测试结果中包含运行时间和测试覆盖率（如果你的测试有源码，且 `totoro` 能识别）。
- 测试成功的浏览器会以绿色字符输出显示，失败或超时的浏览器会以红色字符显示，并输出错误详情。

#### 推荐的项目目录结构

```
project-dir/
  dist/
  src/ or lib/
  tests/ or test/
    runner.html or index.html
```

其中：

- 你需要在 project-dir/ 目录运行 `totoro` 命令
- dist/ 为编译或打包后的输出目录
- src/ 或 lib/ 为源码目录
- tests/ 或 test/ 为测试目录，其中的 runner.html 或 index.html 都能被识别为 runner

## 3. 命令行配置项

### 3.1 totoro


#### -R, --runner

测试 runner。接受本地文件和 URL。

默认：自动查找当前目录，`tests` 或 `test` 子目录下的 `runner.html` 或 `index.html` 均可被识别。

#### -C, --code

方便的 debug 途径。接受 **单个** 表达式、 JS 文件和 URL。totoro 将返回指定表达式计算的值或 JS 文件中所有 console.log() 输出结果。例如：

```
$ totoro --code document.getElementsByClassName
$ totoro --code examples/code/code.js  // 我们真的准备了这个例子，试试看！
```

注意： `--code` 和 `--runner` 是互斥的选项！

#### -b, --browsers

指定要测试的浏览器，多个以逗号分隔。例如：

```
chrome,firefox,safari,ie  //不指定版本
ie/6,ie/7,ie/8,ie/9  //指定版本
```

默认：自动选取测试服务端可用的桌面浏览器。

#### -a, --adapter

测试框架的适配器，用于发送测试报告。接受内置关键字、本地路径和 URL。

已支持的内置关键字有：`mocha`, `jasmine`。

自定义适配器写法可参考 [static/adapters/mocha.js](https://github.com/totorojs/totoro/blob/master/static/adapters/mocha.js)。

默认：如果 `--runner` 指定的是本地路径，则会先查看 runner 所在的位置是否有 `totoro-adapter.js`；如果没找到或者 `--runner` 指定的是 url 则 `totoro-server` 会自动扫描 `--runner` 的内容尝试查找匹配的内置关键字。

#### -c, --charset

文件编码

默认： 'utf8'

#### -t, --timeout

客户端超时时间，单位为分钟。

默认：5

#### -O, --root

如果 `--runner` 是一个本地文件，`totoro` 在测试时会起一个临时的 HTTP 服务，该选项指定这个服务的根目录，接受相对路径和绝对路径。

[参见更多详情](https://github.com/totorojs/totoro/wiki/root-option.zh)

默认：根据 `--runner` 和 `--adapter` 进行猜测。

#### -H, --host

测试服务 host。

默认：阿里的内部host

#### -P, --port

测试服务 port。

默认：9999

#### --skip-coverage

跳过代码覆盖率检查.

默认：false

#### --verbose

显示更详细的信息:
 - debug 日志
 - 如果启用测试代码覆盖率, 将会显示没有覆盖到行的详细信息.

默认：false


### 3.2 totoro list

显示当前可用的测试浏览器。配置项可通过 `totoro list -h` 查看。

![totoro list](https://f.cloud.github.com/assets/340282/892035/ed628190-fa73-11e2-9810-3403502514b2.png)


### 3.3 tororo config

读取或者设置全局配置。配置项可通过 `totoro config -h` 查看。

#### 读取全局配置

```
$ totoro config
```

#### 设置全局配置

```
totoro config --host=10.15.52.87 --port=''
```

将 server-host 设置为 10.15.52.87，将 server-port 置空。

## 4. 配置文件

除了命令行配置项和全局配置，你还可以为你的项目建立名为 `totoro-config.json` 的配置文件，放在项目根目录下。

这 3 种配置方式的优先级为：命令行 > 配置文件 > 全局配置 > 内置默认配置。

以下为一个配置文件的例子：

```
{
  "browsers": ["chrome", "ie/10.0"],
  "host": "127.0.0.1",
  "port": 9999
}
```

## 5. 关于

totoro 的名字来自于宫崎骏导演的奇幻动画电影《龙猫》。
