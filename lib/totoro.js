var its = require('its')
var _ = require('underscore')
var thrillRunner = require('thrill').runner


var defCfg = {
	stream:true,
	verbose:true,
	host:"localhost:9200",
	run:'../../events/tests/runner.html',
	serve:'../../events'
	//run:'../../../other/deck.js/test/index.html'
}


function main(cfg){
	//its.object(cfg, 'cfg is required!')
	//its.string(cfg.run, 'cfg.run is required!')
	
	cfg = _.extend(defCfg, cfg)
	
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


module.exports = main


main()

