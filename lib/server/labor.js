'use strict';

module.exports = Labor

function Labor(socket){
    var self = this
    if (!( self instanceof Labor)) {
        return new Pool(socket)
    }
    self.socket = socket
    self.tasks = []
    
}

Labor.prototype.doTask = function(cfg){
    
}