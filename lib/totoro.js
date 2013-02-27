var its = require('its')
var path = require('path')
var thrillRunner = require('thrill').runner


var defCfg = {
	verbose:true,
	host:"localhost:9200",
	run:'../../other/deck.js/test/index.html'
}


function main(cfg){
	cfg = augment(cfg, defCfg)
	
	thrillRunner(cfg, function(passed){
		if(passed instanceof Error){
			throw passed;
		}
		if(passed){
			process.exit(0);
		} else {
			process.exit(1);
		}
	})
}


function augment(target, src){
	return src
}


module.exports = main


main()