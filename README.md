![totoro - front-end quality assurance toolset](https://f.cloud.github.com/assets/340282/401517/4563cedc-a8dd-11e2-814d-36494351adfa.jpg)

# totoro

A simple, easy-to-use and stable front-end unit testing tool.

Latest version：v0.1.6 [Change Log](https://github.com/totorojs/totoro-test/wiki/change-log)

[中文版使用文档](README.cn.md)

---

## 0. Features

- Run in real browsers
- Support all test frameworks
- Real-time progress feedback and beautiful report
- Robust enough for production enviroment

## 1. Installation

### Install From npm

    sudo npm install totoro -g

### Install From Github

to get the latest function

    git clone git@github.com:totorojs/totoro.git
    cd totoro
    sudo npm install -g
 
## 2. Quick start

For simplicity, we have prepared a testing example for you

    git clone git@github.com:totorojs/totoro.git
    cd examples/mocha
    totoro

Then you should see a output as shown below:

![screen shot 2013-05-02 at 5 05 54 pm](https://f.cloud.github.com/assets/340282/453113/a0ddb208-b307-11e2-8841-c8d9f8318d99.png)

    
## 3. Usage

### Specify Browsers



### Specify Runner Path

    totoro-test --runner customs

### Use Custom Adapter

Adapter is used to report testing progress and result. Mocha, jasmine, yuitest and qunit adapters are built in. It is very easy to write a adapter for your own test framework.

### View Avilable Browsers

    totoro-test --list

![totoro-test --list](https://f.cloud.github.com/assets/340282/401524/8bf080fc-a8dd-11e2-9188-5b0ff30280bb.png)

### Auto Generate Runner For CMD Module

### Test Online Runner


## 4. More Examples

### Official Examples

### Examples From totoro's Users

- SeaJS
- Arale
- Handy

## 5. Launch Your Own Server

    totoro-test --server

## 6. About totoro-test

totoro-test takes it's name from animated fantasy film "My Neighbor Totoro" directed by [Hayao Miyazaki](http://en.wikipedia.org/wiki/Hayao_Miyazaki).


