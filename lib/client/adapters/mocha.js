(function() {
    mocha.reporter(function(runner) {
        var report = top.report
        var id = location.href.match(/runner\/([^/]+)\//)[1]
        var stats = {
            suites : 0,
            tests : 0,
            passes : 0,
            pending : 0,
            failures : 0
        }

        runner.on('start', function() {
            stats.start = new Date
        })

        runner.on('suite', function(suite) {

        })

        runner.on('pass', function(test) {
            stats.passes++
            var medium = test.slow() / 2
            var speed = test.duration > test.slow() ? 'slow' : test.duration > medium ? 'medium' : 'fast'
            report({
                orderId: id,
                action: 'pass',
                info: {
                    parent: getSuiteName(test.parent),
                    title: test.title,
                    speed: speed
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

        runner.on('pending', function() {
            stats.pending++
            report({
                orderId: id,
                action: 'pending'
            })
        })

        runner.on('test end', function(test) {
            stats.tests++
        })

        runner.on('suite end', function(suite) {
            stats.suites++
        })

        runner.on('end', function() {
            stats.end = new Date
            stats.duration = new Date - stats.start
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

