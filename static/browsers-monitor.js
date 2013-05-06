(function() {
    var href = location.href
    var reg = /id=(\d+)$/
    var id
    if (reg.test(href)) {
        id = href.match(reg)[1]
        var socket = io.connect('http://127.0.0.1:9997/status')
        socket.on('connect', function() {
            setInterval(function() {
                socket.emit('running', id)
            }, 30 * 1000)
        })
    }
}())

