![totoro - front-end quality assurance toolset](https://f.cloud.github.com/assets/340282/401517/4563cedc-a8dd-11e2-814d-36494351adfa.jpg)

# totoro

A simple, easy-to-use and stable front-end unit testing tool.

Latest version：v0.1.6 [Change Log](https://github.com/totorojs/totoro/wiki/change-log)

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

For simplicity, we have prepared a testing example for you:

    git clone git@github.com:totorojs/totoro.git
    cd examples/mocha
    totoro

Then you should see a output as shown below:

![screen shot 2013-05-02 at 10 07 37 pm](https://f.cloud.github.com/assets/340282/454134/be965a46-b331-11e2-879f-c944277ef3d1.png)

    
## 3. Examples

### Specify Browsers

    totoro --browsers=chrome,win


### View Avilable Browsers

    totoro-test --list

![8bf080fc-a8dd-11e2-9188-5b0ff30280bb](https://f.cloud.github.com/assets/340282/475431/4ef88324-b78e-11e2-9a18-8958d5b0cea2.png)


### Specify Runner Path

    totoro-test --runner customs

### Use Custom Adapter

Adapter is used to report testing progress and result. Mocha, jasmine, yuitest and qunit adapters are built in. It is very easy to write a adapter for your own test framework.

### Test Online Runner

Not implement, will coming soon.

    totoro --runner http://path/to/runner

### Specify Server

For more usage, please run:

    totoro --help
    
### Examples From totoro's Users

- SeaJS
- Arale
- Handy

## 4. Options

- `verbose` 


## 5. Launch Your Own Server

    totoro-test --server

## 6. About totoro-test

totoro-test takes it's name from animated fantasy film "My Neighbor Totoro" directed by [Hayao Miyazaki](http://en.wikipedia.org/wiki/Hayao_Miyazaki).


