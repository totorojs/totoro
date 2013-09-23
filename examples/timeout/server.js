var express = require('express')
var http = require('http')

var app = express()
var cfg = {
    clientPort: 9998,
    clientHost: getExternalIpAddress()
}

app.use(express.static(process.cwd()))


app.listen(cfg.clientPort, cfg.clientHost, function() {
    console.info('Start client server<' + cfg.clientHost + ':' + cfg.clientPort + '>')

}).on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
        consle.info('Port %d is in use, will auto find another one.', cfg.clientPort)
    } else {
        throw e
    }
})

function getExternalIpAddress () {
    var interfaces = require('os').networkInterfaces()
    var addresses = []
    Object.keys(interfaces).forEach(function(name) {
        interfaces[name].forEach(function(node) {
            if (node.family === 'IPv4' && node.internal === false) {
                addresses.push(node)
            }
        })
    })

    if (addresses.length > 1) {
        return addresses[1].address
    }
    if (addresses.length > 0) {
        return addresses[0].address
    }
}

