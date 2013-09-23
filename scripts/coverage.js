var format = require('util').format;
var data = ''

process.stdin.on('data', function(chunk) {
    data += chunk
})

process.stdin.on('end', function() {
    data = data.replace(/^[^{]*({)/g, '$1')
    data = JSON.parse(data)

    console.log()
    data.files.sort(function(a, b) {
        return a.coverage - b.coverage
    }).forEach(function(item) {
        console.log(format('%s%% - %s', pad(item.coverage), item.filename))
    })
    console.log('\n \033[36m see more details: coverage.html \033[0m')
})


function pad(num) {
    num = num.toFixed(2)
    var len = 9 - num.length
    return new Array(len).join(' ') + num
}

