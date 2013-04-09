(function() {
    mocha.reporter(function(runner) {

        runner.on('start', function() {
            console.log('start')
        });

        runner.on('suite', function(suite) {
            
        });

        runner.on('test end', function(test) {
            
        });

        runner.on('pass', function(test) {
            
        });

        runner.on('fail', function(test, err) {
            
        });

        runner.on('end', function() {
            
             console.log('end')
        });

        runner.on('pending', function() {
            
        });
    })
})()

