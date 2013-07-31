function cleanJSON(data) {
    data = data.replace(/^[^{]*({)/g, '$1');
    if (exports.outputJSON) {
        fs.writeFileSync(exports.outputJSON, data)
    }
    return JSON.parse(data)
}

var data = ''
process.stdin.on('data', function(chunk) {
    data += chunk
})

process.stdin.on('end', function() {
    data = cleanJSON(data)
    console.log(data.coverage)
});
