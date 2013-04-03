(function() {
    var socket = io.connect('/')
    mocha.reporter(function(runner) {

        runner.on('start', function() {
            console.log('start')
             socket.emit('start', { my: 'data' })
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
             socket.emit('end', { my: 'data' })
        });

        runner.on('pending', function() {
            
        });
    })
})()

