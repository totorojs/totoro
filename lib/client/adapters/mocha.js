(function() {
    mocha.reporter(function(runner) {
        var report = top.report
        var id = location.href.match(/runner\/([^/]+)\//)[1]
        var start
        var stats = {
            suites : 0,
            tests : 0,
            passes : 0,
            pending : 0,
            failures : 0
        }

        runner.on('start', function() {
            start = new Date
        })

        runner.on('suite', function(suite) {

        })

        runner.on('pass', function(test) {
            stats.passes++
            var duration = test.duration
            var medium = test.slow() / 2
            var speed = duration > test.slow() ? 'slow' : duration > medium ? 'medium' : 'fast'
            report({
                orderId: id,
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
                orderId: id,
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
                orderId: id,
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
                orderId: id,
                action: 'end',
                info: stats
            })
        })
    })
    
    function getSuiteName(suite){
        var name = suite.title
        while(suite.parent){
            suite = suite.parent
            name = (suite.title || '') + ' ' + name
        }
        return name
    }

})()

