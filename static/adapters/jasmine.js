(function() {

    var jasmine = window.jasmine
    var jasmineEnv = jasmine.getEnv()

    var report = top.report
    var id = location.href.match(/runner\/([^/]+)\//)[1]

    jasmineEnv.addReporter(createTotoroReporter())

    function sendMessage(action, info) {
        report({
            orderId: id,
            action: action,
            info: info
        })
    }

    var testStartTime

    function createTotoroReporter(){
        var stats = {
            suites : 0,
            tests : 0,
            passes : 0,
            pending : 0,
            failures : 0
        }

        var reporter = {}
        var startedSuites = {}
        var runnerStartTime

        reporter.reportRunnerStarting = function(runner){
            runnerStartTime = (+new Date())
        }

        reporter.reportSuiteStarting = function(suite){}

        reporter.reportSpecStarting = function(spec){
            testStartTime = new Date().getTime()
        }

        reporter.reportSpecResults = function(spec){
            var timeElapsed = new Date().getTime() - testStartTime
            var results = spec.results()
            var suiteName = spec.suite.getFullName()

            // Since jasmine doesn't have a hook for this, we have to
            // manually keep track and manage
            if(!(suiteName in startedSuites)){
                startedSuites[suiteName] = true
                reporter.reportSuiteStarting(spec.suite)
            }

            var data = {
                parent: suiteName,
                title: spec.description,
                duration: results.skipped ? 0 : timeElapsed,
                message: ''
            }

            var action = 'pass'

            stats.passes += results.passedCount
            stats.failures += results.failedCount

            if(results.failedCount > 0){
                action = 'fail'
                each(results.getItems(), function(result){
                    if(!result.passed()){
                        data.message += formatError(result)
                    }
                })
            }

            sendMessage(action, data)
        }

        reporter.reportSuiteResults = function(suite){
            stats.tests++
        }

        reporter.reportRunnerResults = function(runner){
            stats.duration = (+new Date()) - runnerStartTime
            sendMessage('end', stats)
        }

        return reporter
    }

    var LIBRARY_JUNK_REGEX = /.*jasmine.*\.js/i
    var THRILL_JUNK_REGEX = /\(.*\/g\/.*?\//i
    var QUEEN_JUNK_REGEX = /\?queenSocketId=([\w\-])*/i
    var NEW_LINE_REGEX = /\n/g


    function formatError(result) {
        var stack = result.trace.stack,
            message = result.message

        if(stack){
            if (message && ~message.indexOf(stack.substring(0, stack.indexOf('\n') - 1))) {
                stack = message + '\n' + stack
            }

            stack = stack.split(NEW_LINE_REGEX)

            stack = filter(stack, function(line, index, arr){

                if(LIBRARY_JUNK_REGEX.test(line)) return false

                // Remove the junk queen adds on
                // We have to address the array by index in this case
                // so the line actually gets updated
                arr[index] = line.replace(THRILL_JUNK_REGEX,'(').replace(QUEEN_JUNK_REGEX,'')

                return true
            })

            return stack.join('\n')
        }

        return message
    }

    function each(arr, func){
        var index = 0,
            length = arr.length

        for(; index < length; index++){
            func.call(null, arr[index], index, arr)
        }
    }

    function filter(arr, func){
        var index = 0,
            length = arr.length,
            result = []

        for(; index < length; index++){
            if(func.call(null, arr[index], index, arr)){
                result.push(arr[index])
            }
        }
        return result
    }
})()

