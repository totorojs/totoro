# Sinon.js

用于 JavaScript 的测试监视(spy)、桩(stub)和仿制(mock)功能。不依赖其他类库，兼容任何单元测试框架。

该页面包含了完整的 Sinon.js API 文档，以及针对概念实现的简要介绍。

## Test spies

### 什么是 test spy ？

test spy 是这样的一类函数，它可以记录自己被调用的情况，包括传入的参数、返回结果、this 指向和抛出的错误（如果有的话）。test spy 可以是一个匿名函数，也可以是对一个已有函数进行的封装。

### 谁使用 spies ?

test spies 可用于测试回调函数，或者确认在测试中，系统中的某个方法/函数是如何被使用的。以下代码演示了如何使用 spies 来测试一个函数是如何操作其回调函数的。
 
    "test should call subscribers on publish": function () {
        var callback = sinon.spy();
        PubSub.subscribe("message", callback);
    
        PubSub.publishSync("message");
    
        assertTrue(callback.called);
    }
    
### Spying 已有方法

sinon.spy 也可以监视已有函数。在使用被监视的函数时，这个函数的表现将完全正常（包括作为构造器使用时），但你还可以访问跟这个函数调用相关的数据。以下是一个我们特地杜撰的例子：

    {
        setUp: function () {
            sinon.spy(jQuery, "ajax");
        },
    
        tearDown: function () {
            jQuery.ajax.restore(); // Unwraps the spy
        },
    
        "test should inspect jQuery.getJSON's usage of jQuery.ajax": function () {
            jQuery.getJSON("/some/resource");
    
            assert(jQuery.ajax.calledOnce);
            assertEquals("/some/resource", jQuery.ajax.getCall(0).args[0].url);
            assertEquals("json", jQuery.ajax.getCall(0).args[0].dataType);
        }
    }
    
### 3 种创建 spies 的方法: sinon.spy()

- **var spy = sinon.spy();**

    创建一个匿名函数用于记录其每次被调用的传入参数、this 值、异常和返回值。
    
- **var spy = sinon.spy(myFunc);**

    监视一个已有的函数。
    
- **var spy = sinon.spy(object, "method");**

    为 object.method 创建一个 spy，即使用 spy 替换原方法。这个 spy 的表现在各方面都和原方法很像。原方法可以通过调用 object.method.restore() 方法还原。返回的 spy 就是替换原方法的函数对象，即 spy === object.method 。

### Spy API

Spies 提供过了一套丰富的接口来检测它们的使用。上面的例子中演示了 calledOnce 这个布尔类属性以及 getCall 方法和返回的对象参数属性。一共有 3 种方式检查所有的数据。

首选的方式是使用 spy 的 calledWith 方法，因为它能将你的测试和过于琐细的调用细节隔离开来。只要一个 spy 曾经使用指定参数调用过，那么它将返回 true。

    "test should call subscribers with message as first argument" : function () {
        var message = 'an example message';
        var spy = sinon.spy();
    
        PubSub.subscribe(message, spy);
        PubSub.publishSync(message, "some payload");
    
        assert(spy.calledWith(message));
    }

如果你希望更明确一些，你可以直接检查第一次调用的第一个参数。有以下两种方式：

    "test should call subscribers with message as first argument" : function () {
        var message = 'an example message';
        var spy = sinon.spy();
    
        PubSub.subscribe(message, spy);
        PubSub.publishSync(message, "some payload");
    
        assertEquals(message, spy.args[0][0]);
    }

和

    "test should call subscribers with message as first argument" : function () {
        var message = 'an example message';
        var spy = sinon.spy();
    
        PubSub.subscribe(message, spy);
        PubSub.publishSync(message, "some payload");
    
        assertEquals(message, spy.getCall(0).args[0]);
    }
    
第一个例子使用了一个 spy 上的二维数组来直接访问，第二个例子先获取到第一个调用对象，然后再访问他的参数数组。可以根据你的偏好决定使用哪一种方法，但我们还是推荐使用 spy.calledWith(arg1, arg2, ...)，除非你确实有原因需要测试得如此精确。

### Spy API

sinon.spy() 方法会返回一个 spy 对象。当监视已有方法时，使用 sinon.spy(object, method)。以下是返回的 spy 对象和 object.method 均可用的属性和方法。

- **spy.withArgs(arg1[, arg2, ...]);**

    创建一个 spy，这个 spy 仅记录那些传入了和传递给 withArgs 相同参数的调用。这可以使得你的断言更富有表达力。

    "test should call method once with each argument": function () {
        var object = { method: function () {} };
        var spy = sinon.spy(object, "method");
        spy.withArgs(42);
        spy.withArgs(1);
        
        object.method(42);
        object.method(1);
        
        assert(spy.withArgs(42).calledOnce);
        assert(spy.withArgs(1).calledOnce);
    }
    
- **spy.callCount**

    记录调用的次数。

- **spy.called**

    如果 spy 至少被调用一次，则为 true。

- **spy.calledOnce**

    如果 spy 刚好被调用一次，则为 true。
    
- **spy.calledTwice**

    如果 spy 刚好被调用两次，则为 true。

- **spy.calledThrice**

    如果 spy 刚好被调用三次，则为 true。

- **spy.firstCall**

    第一次调用对象（记录了第一次调用的相关信息）。
    
- **spy.secondCall**

    第二次调用对象。

- **spy.thirdCall**

    第三次调用对象。
    
- **spy.lastCall**

    最后一次调用对象。

- **spy.calledBefore(anotherSpy);**

    如果 spy 在 anotherSpy 之前调用，则返回 true。

- **spy.calledAfter(anotherSpy);**

    如果 spy 在 anotherSpy 之后调用，则返回 true。

- **spy.calledOn(obj);**

    如果 spy 至少有一次调用使用 obj 作为 this 对象，则返回 true。

- **spy.alwaysCalledOn(obj);**

    如果 spy 的调用总是使用 obj 作为 this 对象，则返回 true。
    
- **spy.calledWith(arg1, arg2, ...);**

    如果 spy 至少有一次调用是使用了给定的参数，则返回 true。它可以用于部分匹配，Sinon 仅将提供的参数和实际的参数进行对比，因此如果一次调用接收了给定的参数（在相同的位置），并且可能页接收了其他参数，那么也将返回 true。

- **spy.alwaysCalledWith(arg1, arg2, ...);**

    如果 spy 的调用总是使用给定的参数（还可能包含其他的），则返回 true。
    
- **spy.calledWithExactly(arg1, arg2, ...);**

    如果 spy 至少有一次调用是刚好使用了给定的参数，而没有其他参数，则返回 true。
    
- **spy.alwaysCalledWithExactly(arg1, arg2, ...);**

    如果 spy 的调用总是刚好使用了给定的参数，则返回 true。

- **spy.calledWithMatch(arg1, arg2, ...);**

    如果 spy 至少有一次调用使用了跟给定参数匹配的参数（还可能包含其他的），则返回 true。其表现类似于 `spy.calledWith(sinon.match(arg1), sinon.match(arg2), ...)` 。

- **spy.alwaysCalledWithMatch(arg1, arg2, ...);**

    如果 spy 的调用总是使用了匹配的参数（还可能包含其他的），则返回 true。其表现类似于`spy.alwaysCalledWith(sinon.match(arg1), sinon.match(arg2), ...)` 。

- **spy.calledWithNew();**

    如果 spy 或 stub 是通过 new 操作符调用的，则返回 true。注意，这个推断是基于 this 对象的值和 spy 函数的原型，所以如果你动态的返回正确的对象的话（如工厂模式？）它可能会产生误报。

- **spy.neverCalledWith(arg1, arg2, ...);**

    如果 spy 或 stub 从来没有调用使用的是给定的参数，则返回 true。

- **spy.neverCalledWithMatch(arg1, arg2, ...);**

    如果 spy 或 stub 从来没有调用使用的是匹配给定的参数，则返回 true。其表现类似于 `spy.neverCalledWith(sinon.match(arg1),sinon.match(arg2), ...)` 。

- **spy.threw();**

    如果 spy 至少抛出过一次异常，则返回 true。

- **spy.threw("TypeError");**

    如果 spy 至少抛出过一次给定类型的异常，则返回 true。

- **spy.threw(obj);**

    如果 apy 至少抛出过一次给定异常对象，则返回 true。

- **spy.alwaysThrew();**

    如果 spy 总是抛出异常，则返回 true。

- **spy.alwaysThrew("TypeError");**

    如果 spy 总是抛出给定类型的异常，则返回 true。

- **spy.alwaysThrew(obj);**

    如果 spy 总是抛出给定异常对象，则返回 true。

- **spy.returned(obj);**

    如果 spy 至少返回过一次给定值，则返回 true。如果要使用严格的比较，可以使用 `spy.returned(sinon.match.same(obj))` 来对对象和数组进行深度比较。

- **spy.alwaysReturned(obj);**

    如果 spy 总是返回给定值，则返回 true。

- **var spyCall = spy.getCall(n);**

    返回第 n 次调用对象。当 spy 被多次调用时，访问单次调用对于更细节的行为验证很有帮助。例如：
    
        sinon.spy(jQuery, "ajax");
        jQuery.ajax("/stuffs");
        var spyCall = jQuery.ajax.getCall(0);
        
        assertEquals("/stuffs", spyCall.args[0]);
        
- **spy.thisValues**

    this 对象的数组， spy.thisValues[0] 是第一次调用时的 this 对象。

- **spy.args**

    接收的参数数组，spy.args[0] 是第一次调用时接收的参数数组。

- **spy.exceptions**

    抛出的异常对象的数组， spy.exceptions[0] 是第一次调用抛出的异常对象。如果第 n 次调用没有抛出任何异常，则 spy.exceptions[n] 为 undefined。

- **spy.returnValues**

    返回值数组，spy.returnValues[0] 是第一次调用的返回值。如果第 n 次调用没有返回值，则 spy.returnValues[n] 为 undefined。
    
- **spy.reset()**

    重置 spy 的状态。

- **spy.printf("format string", [arg1, arg2, ...])**

    返回格式化后的字符串。
    
    - %n: spy 的名称 (默认为"spy")
    - %c: spy 被调用的次数，既 ("once", "twice", 等等。)
    - %C: 一个表示 spy 的调用的列表，每个调用都以一个新行和四个空格为前缀。
    - %t: 用逗号分隔的 spy 被调用时的 this 对象列表。
    - %i: 传递给 printf 的第 i 个要格式化的值。
    - %*: 逗号分隔的传递给 printf 的（未格式化的字符串）参数列表。

### spy 调用对象

- **var spyCall = spy.getCall(n)**

    返回第 n 次调用对象。当 spy 被多次调用时，访问单次调用对于更细节的行为验证很有帮助。例如：

        sinon.spy(jQuery, "ajax");
        jQuery.ajax("/stuffs");
        var spyCall = jQuery.ajax.getCall(0);
        
        assertEquals("/stuffs", spyCall.args[0]);

- **spyCall.calledOn(obj);**
    
    如果这次调用的 this 对象为给定值的话，则返回 true。

- **spyCall.calledWith(arg1, arg2, ...);**

    如果这次调用接收的参数为给定值的话（可能还有其他参数），则返回 true。

- **spyCall.calledWithExactly(arg1, arg2, ...);**
    
    如果这次调用接收的参数刚好是给定值的话（无其其他参数），则返回 true。

- **spyCall.calledWithMatch(arg1, arg2, ...);**

    如果这次调用接收的参数匹配给定的值（可能还有其他参数）。其表现类似于`spyCall.calledWith(sinon.match(arg1), sinon.match(arg2), ...)`。

- **spyCall.notCalledWith(arg1, arg2, ...);**

    如果这次调用接收的参数不是给定的值，则返回 true。

- **spyCall.notCalledWithMatch(arg1, arg2, ...);**

    如果这次调用接收的参数不匹配给定的值，则返回 true。其表现类似于 `spyCall.notCalledWith(sinon.match(arg1), sinon.match(arg2), ...)`。

- **spyCall.threw();** 

    如果这次调用有抛出异常，则返回 true。

- **spyCall.threw("TypeError");**

    如果这次调用抛出了给定类型的异常，则返回 true。

- **spyCall.threw(obj);**

    如果这次调用抛出了给定的异常对象，则返回 true。

- **spyCall.thisValue**

    这次调用的 this 对象。
    
- **spyCall.args**

    接收的参数数组。

- **spyCall.exception**

    抛出的异常。

- **spyCall.returnValue**

    这次调用的返回值。


## Test stubs

### 什么是 stubs?

Test stubs 是一类预编码行为的函数（也是一种 spy）。除了改变 stub 对象的行为之外，它还支持所有的 spy API。

同 spy 一样，stubs 可以是匿名函数，或者包装已有函数。当使用 stub 包装一个已有函数时，原函数将不会被调用。

### 什么时候使用 stubs?

以下情况你会需要使用 stub：

1. 在测试中控制一个方法的行为，以强制代码沿特定路径执行。例如测试错误处理时，可以强制一个方法抛出错误。
2. 当你希望阻止一个方法被直接调用时（可能是因为这个方法触发了干扰行为，例如 XHR 请求之类的）。

以下例子来自 Morgan Roderick 的 PubSubJS 的一段测试代码，这段代码显示了如何创建一个调用时会抛出异常的匿名 stub：


    "test should call all subscribers, even if there are exceptions" : function(){
        var message = 'an example message';
        var error = 'an example error message';
        var stub = sinon.stub().throws();
        var spy1 = sinon.spy();
        var spy2 = sinon.spy();
    
        PubSub.subscribe(message, stub);
        PubSub.subscribe(message, spy1);
        PubSub.subscribe(message, spy2);
    
        PubSub.publishSync(message, undefined);
    
        assert(spy1.called);
        assert(spy2.called);
        assert(stub.calledBefore(spy1));
    }

注意 stub 也实现了 spy 的接口。这个测试校验了所有的回调函数都被调用了，并且抛出异常的 stub 先于另外一个回调函数被调用。

### Stub API

- **var stub = sinon.stub();**
    
    创建一个匿名的 stub 函数。

- **var stub = sinon.stub(object, "method");**
    
    使用一个 stub 函数替代 object.method。原函数可以通过调用 object.method.restore() （或 stub.restore()）方法来还原。如果 object.method 不是一个函数，则会抛出一个异常来帮助你避免类型错误。

- **var stub = sinon.stub(object, "method", func);**
    
    使用 func 来替换 object.method，并且被包装在一个 spy 中。object.method.restore() 可以恢复原方法。

- **var stub = sinon.stub(obj);**

    stub 该对象的所有方法。

- **stub.withArgs(arg1[, arg2, ...]);**
    
    仅当传入给定参数时，stub 该方法。这使得你的断言更富有表现力，你可以使用这个调用访问到 spy 对象。创建的这个 stub，对于不同的传入参数可以有不同的表现。。
    
        "test should stub method differently based on arguments": function () {
            var callback = sinon.stub();
            callback.withArgs(42).returns(1);
            callback.withArgs(1).throws("TypeError");
        
            callback(); // No return value, no exception
            callback(42); // Returns 1
            callback(1); // Throws TypeError
        }
        
- **stub.returns(obj);**

    返回给定对象。

- **stub.returnsArg(index);**

    返回指定索引位置的参数。stub.returnsArg(0) 返回 stub 的第一个参数。

- **stub.throws();**

    抛出一个异常（错误）。
    
- **stub.throws("TypeError");**

    抛出一个给定类型的异常。

- **stub.throws(obj);**

    抛出一个给定的异常对象。

- **stub.callsArg(index);**

    使得 stub 将其调用时接收的索引位置的参数当做一个回调函数进行调用。stub.callsArg(0) 使得 stub 将其调用时接收的第一个参数作为回调函数进行调用。

- **stub.callsArgOn(index, context);**

    类似于上一个方法，context 作为回调函数运行时的 this 对象。

- **stub.callsArgWith(index, arg1, arg2, ...);**

    类似 callsArg，传入给定参数来调用回调函数时。
    
- **stub.callsArgOnWith(index, context, arg1, arg2, ...);**

    参考上面的方法。

- **stub.yields([arg1, arg2, ...])**

    类似于 callsArg，使得 stub 调用第一个回调函数（通过接收参数的类型匹配判定么？），并传入给定的参数（如果有的话）。如果这个方法有多余一个回调函数，你还是需要使用 callsArg 来让 stub 调用这些回调函数。

- **stub.yieldsOn(context, [arg1, arg2, ...])**

    类似 yields，context 作为回调函数运行时的 this 对象。

- **stub.yieldsTo(property, [arg1, arg2, ...])**

    当 stub 仅接收一个 object 类型的参数时，指明这个参数的 property 属性是一个回调函数。类似 yields，yieldsTo 抓取第一个匹配的参数，找到回调函数，并使用给定的参数（可选）来调用它。

        "test should fake successful ajax request": function () {
            sinon.stub(jQuery, "ajax").yieldsTo("success", [1, 2, 3]);
        
            jQuery.ajax({
                success: function (data) {
                    assertEquals([1, 2, 3], data);
                }
            });
        }
        
- **stub.yieldsToOn(property, context, [arg1, arg2, ...])**

    类似上述方法，只是增加了 context 参数作为回调函数运行时的 this 对象。

- **spy.callArg(argNum)**

    类似 yield，但是提供了一个参数用于指定调用第几个回调函数。如果一个函数接收不只一个回调函数时非常有用。在以下例子中，第一个回调参数就不会被调用。

    "calling the last callback": function () {
        var callback = sinon.stub();
        callback(function () {
            console.log("Success!");
        },
        function () {
            console.log("Oh noes!");
        });
    
        callback.callArg(1); // Logs "Oh noes!"
    }

- **spy.callArgWith(argNum, [arg1, arg2, ...])**

    类似 callArg，但给定回调参数。

- **stub.callsArgAsync(index);**
- **stub.callsArgOnAsync(index, context);**
- **stub.callsArgWithAsync(index, arg1, arg2, ...);**
- **stub.callsArgOnWithAsync(index, context, arg1, arg2, ...);**
- **stub.yieldsAsync([arg1, arg2, ...])**
- **stub.yieldsOnAsync(context, [arg1, arg2, ...])**
- **stub.yieldsToAsync(property, [arg1, arg2, ...])**
- **stub.yieldsToOnAsync(property, context, [arg1, arg2, ...])**

类似对应的非异步方法，区别在于回调函数的调用被推迟了（没有立即执行，而是通过一个短暂的 timeout 在另一个线程中执行）。









