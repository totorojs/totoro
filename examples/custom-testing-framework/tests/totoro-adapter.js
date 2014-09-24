(function() {
  mocha.reporter(function(runner) {
    var report = totoro.report

    var stats = {
      suites: 0,
      tests: 0,
      passes: 0,
      pending: 0,
      failures: 0
    }
    var start

    runner.on('start', function() {
      start = new Date()
    })

    runner.on('suite', function(suite) {

    })

    runner.on('pass', function(test) {
      stats.passes++
      var duration = test.duration
      var medium = test.slow() / 2
      var speed = duration > test.slow() ? 'slow' : duration > medium ? 'medium' : 'fast'
      report({
        action: 'pass',
        info: {
          parent: getSuiteName(test.parent),
          title: test.title,
          speed: speed,
          duration: duration
        }
      })
    })

    runner.on('fail', function(test, err) {
      stats.failures++
      report({
        action: 'fail',
        info: {
          parent: getSuiteName(test.parent),
          title: test.title,
          message: err.message
        }
      })
    })

    runner.on('pending', function(test) {
      stats.pending++
      report({
        action: 'pending',
        info: {
          parent: getSuiteName(test.parent),
          title: test.title
        }
      })
    })

    runner.on('test end', function(test) {
      stats.tests++
    })

    runner.on('suite end', function(suite) {
      stats.suites++
    })

    runner.on('end', function() {
      stats.duration = new Date() - start
      report({
        action: 'end',
        info: stats
      })
    })
  })

  function getSuiteName(suite){
    var name = suite.title
    while(suite.parent){
      suite = suite.parent
      if (suite.title) {
        name = suite.title + ' > ' + name
      }
    }
    return name
  }

})()

