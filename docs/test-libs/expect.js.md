# Expect

基于 [should.js](http://github.com/visionmedia/should.js) 的轻量的 BDD 断言工具

```js
expect(window.r).to.be(undefined);
expect({ a: 'b' }).to.eql({ a: 'b' })
expect(5).to.be.a('number');
expect([]).to.be.an('array');
expect(window).not.to.be.an(Image);
```

## 特性

- 跨浏览器: 兼容 IE6+, Firefox, Safari, Chrome, Opera。
- 兼容所有的测试框架。
- Node.JS 中通过 `require('expect.js')` 使用。
- 独立的，仅有一个没有使用原型扩展或者垫片的全局变量。

## 如何使用

### 在 Node 中使用

使用 NPM 进行安装或者把它到你的 `package.json` 中：

```
$ npm install expect.js
```

然后：

```js
var expect = require('expect.js');
```

### 在浏览器中使用

在页面中引入位于 github 仓库最顶层的 `expect.js`：

```html
<script src="expect.js"></script>
```

## API

**ok**: 断言值是否为 _真_ 

```js
expect(1).to.be.ok();
expect(true).to.be.ok();
expect({}).to.be.ok();
expect(0).to.not.be.ok();
```

**be** / **equal**: 断言全等于 `===`

```js
expect(1).to.be(1)
expect(NaN).not.to.equal(NaN);
expect(1).not.to.be(true)
expect('1').to.not.be(1);
```

**eql**: 断言是否（宽松的）相等，可用于 objects 

```js
expect({ a: 'b' }).to.eql({ a: 'b' });
expect(1).to.eql('1');
```

**a**/**an**: 断言类型，支持 `array` 类型判断，也支持 `instanceof` 判断

```js
// typeof with optional `array`
expect(5).to.be.a('number');
expect([]).to.be.an('array');  // works
expect([]).to.be.an('object'); // works too, since it uses `typeof`

// constructors
expect(5).to.be.a(Number);
expect([]).to.be.an(Array);
expect(tobi).to.be.a(Ferret);
expect(person).to.be.a(Mammal);
```

**match**: 断言字符串的正则匹配情况

```js
expect(program.version).to.match(/[0-9]+\.[0-9]+\.[0-9]+/);
```

**contain**: 断言是否在某个数组或字符串中

```js
expect([1, 2]).to.contain(1);
expect('hello world').to.contain('world');
```

**length**: 断言数组的 `.length` 属性

```js
expect([]).to.have.length(0);
expect([1,2,3]).to.have.length(3);
```

**empty**: 断言一个数组是否为空

```js
expect([]).to.be.empty();
expect({}).to.be.empty();
expect({ length: 0, duck: 'typing' }).to.be.empty();
expect({ my: 'object' }).to.not.be.empty();
expect([1,2,3]).to.not.be.empty();
```

**property**:断言own属性是否存在，以及这个属性是否是指定值

```js
expect(window).to.have.property('expect')
expect(window).to.have.property('expect', expect)
expect({a: 'b'}).to.have.property('a');
```

**key**/**keys**: 断言键是否存在. 支持 `only` 装饰器。

```js
expect({ a: 'b' }).to.have.key('a');
expect({ a: 'b', c: 'd' }).to.only.have.keys('a', 'c');
expect({ a: 'b', c: 'd' }).to.only.have.keys(['a', 'c']);
expect({ a: 'b', c: 'd' }).to.not.only.have.key('a');
```

**throwException**/**throwError**: 断言方法调用时是否抛错

```js
expect(fn).to.throwError(); // synonym of throwException
expect(fn).to.throwException(function (e) { // get the exception object
  expect(e).to.be.a(SyntaxError);
});
expect(fn).to.throwException(/matches the exception message/);
expect(fn2).to.not.throwException();
```

**within**: 断言数值的范围

```js
expect(1).to.be.within(0, Infinity);
```

**greaterThan**/**above**: 断言 `>`

```js
expect(3).to.be.above(0);
expect(5).to.be.greaterThan(3);
```

**lessThan**/**below**: 断言 `<`

```js
expect(0).to.be.below(3);
expect(1).to.be.lessThan(3);
```

**fail**: 强制使测试失败

```js
expect().fail()
expect().fail("Custom failure message")
```

## 和测试框架配合使用

例如，你可以使用
[mocha](http://github.com/visionmedia/mocha).
创建一个测试套件。

假定我们想要测试以下代码：

**math.js**

```js
function add (a, b) { return a + b; };
```

我们的测试文件看起来应该是像这样的：

```js
describe('test suite', function () {
  it('should expose a function', function () {
    expect(add).to.be.a('function');
  });

  it('should do math', function () {
    expect(add(1, 3)).to.equal(4);
  });
});
```

如果某个个结果和期望值不匹配，expect 就会抛出一个异常，而这个异常会被测试运行器（runner）捕捉到，并显示给用户，或做出进一步的处理。

## 和 should.js 的不同之处

- 不需要像 `should.strictEqual` 这样的静态的 `should` 方法。例如 `expect(obj).to.be(undefined)` 就能工作的很好。
- 一些 API 做出了修改或简化。
- 一些 API 做出了浏览器兼容性相关的修改。

## 运行测试

克隆代码仓库并安装。

```
git clone git://github.com/LearnBoost/expect.js.git expect
cd expect && npm install
```

### 在 Node 中运行

`make test`

### 在浏览器中运行

`make test-browser`

然后打开你想测试的浏览器访问： `http://localhost:3000/test/`

## 证书

(The MIT License)

Copyright (c) 2011 Guillermo Rauch &lt;guillermo@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### 三方库

Heavily borrows from [should.js](http://github.com/visionmedia/should.js) by TJ
Holowaychuck - MIT.