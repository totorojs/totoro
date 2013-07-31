all: test coverage jshint

test:
	@mocha tests
	@$(MAKE) coverage cov-args=json-cov | node scripts/coverage.js

cov-args = html-cov > coverage.html
coverage:
	@jscoverage lib lib-cov
	@mv lib lib-bak
	@mv lib-cov lib
	@mocha tests -R $(cov-args)
	@rm -rf lib
	@mv lib-bak lib

jshint:
	@jshint lib/*.js
	@jshint tests/*.js


.PHONY: all test coverage jshint
