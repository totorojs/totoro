# Run tests using your own testing framework

You just need to write a light adapter :)

Note: You can specify it with --adapter option. If not specified, totoro will try to find out **totoro-adapter.js** at the same dir of runner.

    $ git clone git@github.com:seajs/seajs.git
    $ cd seajs
    $ totoro

# run online seajs
    $ totoro --runner=http://seajs.github.io/seajs/tests/runner.html  --adapter=http://seajs.github.io/seajs/tests/totoro-adapter.js

