repo = require('./repo');

function run(path){
    repo.clone(path);
}

exports.run = run;

run('git@github.com:aralejs/calendar.git');
