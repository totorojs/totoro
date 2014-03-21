(function() {
  console.log(document.body)

  console.log(1)
  console.log(new Number(1))
  console.log(NaN)
  console.log(Number.MAX_VALUE)

  console.log('I am a string')
  console.log(new String('I am also a string'))

  console.log(true)
  console.log(new Boolean(false))

  console.log(function foo(name) {return name})
  var bar = function(x, y, z){
      return z + y + z
  }
  console.log(bar)
  console.log(new Function('return "function created by constructor"'))

  var arr = ['I', 'am', 'an', 'array']
  console.log(arr)

  console.log({plain: 'object', fn: bar, arr: arr})

  console.log(null)

  console.log(undefined)

  console.log(new Date())

  console.log(/regexp/ig)
  console.log(new RegExp('regexp'))

  console.log(new Error())
})()
