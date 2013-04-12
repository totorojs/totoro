(function() {
    var report = top.report
    var id = location.href.match(/runner\/([^/]+)\//)[1]
    window.onerror = function(message, url, line){
        report({
            orderId: id,
            action: 'end',
            error: {
                message: message,
                url: url,
                line: line
            }
        })
        return true
    }
})()