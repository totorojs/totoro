![totoro](https://f.cloud.github.com/assets/340282/891339/657d9018-fa54-11e2-9760-6955388fd8fc.jpg)

# totoro

A simple & stable front-end unit testing tool.

Latest stable version：v0.4.0 [Change Log](https://github.com/totorojs/totoro/wiki/change-log)

[![building status](https://travis-ci.org/totorojs/totoro.png?branch=master)](https://travis-ci.org/totorojs/totoro)

[中文版使用文档](README.zh.md)

---

## 0. Features

- Run in real browsers
- Support all test frameworks
- Support debug
- Auto testing coverage
- **Robust enough for actual combat**

## 1. Installation

### Node requirement

\>= 0.10.12

### Install from npm

```
$ npm install totoro -g
```

If it not works, you may add `sudo` before the command, as follows.

### Install from github

To get the latest function (may not be stable)

```
$ git clone git@github.com:totorojs/totoro.git
$ cd totoro
$ npm install -g
```

## 2. Quick Start

For simplicity, we have already prepared an example for you:

### Important: please specify a server first !

```
$ totoro config --server-host={{yourServerHost}}
```

The default value is a internal server for Alibaba group, you can [launch your own server](https://github.com/totorojs/totoro-server).

We are planning to supply an open service, hmm...

```
$ git clone git@github.com:totorojs/totoro.git
$ cd totoro/examples/simple
$ totoro
```

Then you should see a output as shown below:

![totoro-result](https://f.cloud.github.com/assets/340282/891944/7c099544-fa71-11e2-828b-5da8c0566834.png)

- Green dot means a test case passed, red cross means a test case failed.
- Every browser supplies it's own run time and testing coverage (if your test has source code, and `totoro` can recognize).
- If all test cases passed, will report in green color, or will report in red color with detailed error message.

#### Recommended directory structure

Generally, if your test is a local file and the directory structure of your project is as bellow, you can run `totoro` without any config.

```
project-dir/
  dist/
  src/ or lib/
  tests/ or test/
    runner.html or index.html
```

## 3. Cli Options

All options are optional.

### 3.1 totoro

#### --runner

Test runner. Accept local file and URL.

Default: auto search in the CWD, `runner.html` or `index.html` in subdirectory `test/` or `tests/` could be recognized.

#### --code

A convenient way to debug. Accept **single** JS expression, local file or URL. totoro will return the calculated value of expression or all output of console.log() in JS file. For example:

```
$ totoro --code document.getElementsByClassName
$ totoro --code examples/code/code.js  // this file already exists, try it!
```

Be mind that `--code` and `--runner` are mutually exclusive!

#### --adapter

Test framework's adapter, used to send report to server. Accept built-in keywords, local file and URL.

Built-in keywords: `mocha`, `jasmine`.

It is very easy to write an adapter for custom test framework, you could refer to [static/adapters/mocha.js](https://github.com/totorojs/totoro/blob/master/static/adapters/mocha.js).

Default: if `--runner` is local file, `totoro` will see if there is `totoro-adapter.js` in the same directory , if not found or `--runner` is URL, [totoro-server](https://github.com/totorojs/totoro-server) will try to find out matched keyword according to `--runner` content.

#### --browsers

Specify a comman-delimited list of browser names. For example:

```
chrome,firefox,safari,ie  //just specify browser names
ie/6,ie/7,ie/8,ie/9  //specify browser names and versions
```

Default: all available desktop browsers.

#### --timeout

Specifies the client timeout in minutes.

Default：5

#### --server-host

totoro-server host。

Default: internal server host for Alibaba group.

#### --server-port

totoro-server port。

Default: 9999

#### --client-root

If assign a local file to `--runner`, `totoro` need to launch a temporary HTTP server for testing, `--client-root` is the root of this server.

Default: if necessary, guess a path according to `--runner` and `--adapter`.

#### --skip-coverage

No need testing coverage.

Default: false

#### --verbose

Show more info.

Default: false

### 3.2 totoro list

Show all available browsers of specified server.

![totoro list](https://f.cloud.github.com/assets/340282/892035/ed628190-fa73-11e2-9810-3403502514b2.png)

### 3.3 totoro config

Read or write global config.

#### Read global config

```
$ totoro config
```

#### Write global config

```
$ totoro config --server-host=10.15.52.87 --server-port=''
```

Above command clear the `--server-port` value.

## 4. Config File

If you need a config file, just place `totoro-config.json` in the CWD.

The priority level of all config ways are: `command line > config file > totoro config > default config`

Below is an example for config file:

```
{
  "browsers": ["chrome", "ie/10.0"],
  "serverHost": "127.0.0.1",
  "serverPort": 9999
}
```

## 5. About

totoro takes it's name from animated fantasy film "My Neighbor Totoro" directed by [Hayao Miyazaki](http://en.wikipedia.org/wiki/Hayao_Miyazaki).


