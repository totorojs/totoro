![totoro - front-end quality assurance toolset](https://f.cloud.github.com/assets/340282/401517/4563cedc-a8dd-11e2-814d-36494351adfa.jpg)

# totoro-test (will be finished in April 25)

A simple, easy-to-use and stable front-end unit testing tool.

Latest version：v0.1.5 [Change Log](https://github.com/totorojs/totoro-test/wiki/change-log)

[中文版使用文档](README.cn.md)

---

## 1. Installation

### Install From npm

    sudo npm install totoro-test -g

### Install From Github

to get the latest function

    git clone git@github.com:totorojs/totoro-test.git
    cd totoro-test
    sudo npm install -g

## 2. Quick Start

1. gitclone

2. Run

        totoro-test

    Then you should see a report like the image below:

    
## 3. Usage

### Specify Platforms



### Specify Runner Path

    totoro-test --runner customs

### Custom Adapter

Adapter is used to report testing progress and result. Mocha, jasmine, yuitest and qunit adapters are built in. It is very easy to write a adapter for your own test framework.

### View Avilable Browsers

    totoro-test --list

![totoro-test --list](https://f.cloud.github.com/assets/340282/401524/8bf080fc-a8dd-11e2-9188-5b0ff30280bb.png)

### Auto Generate Runner For CMD Module


## 4. More Examples

### Official Examples

### Examples From totoro-test's Users

- SeaJS
- Arale
- Handy

## 5. Launch Your Own Server

    totoro-test --server

## 6. Features

- Tests run in real browsers
- Support all test frameworks
- Real-time progress feedback
- Well formed tesging report

## 7. About totoro-test

totoro-test takes it's name from animated fantasy film "My Neighbor Totoro" directed by [Hayao Miyazaki](http://en.wikipedia.org/wiki/Hayao_Miyazaki).


