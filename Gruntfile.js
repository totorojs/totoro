'use strict';

var path = require('path')
var shelljs = require('shelljs')


module.exports = function(grunt) {

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-shell')
    grunt.loadNpmTasks('grunt-mocha-test')
    grunt.loadNpmTasks('grunt-contrib-jshint')


    // Project configuration.
    grunt.initConfig({

        jshint: {
            all: [
                'Gruntfile.js',
                'lib/*.js'
            ],
            options: {
                'jshintrc': '.jshintrc'
            }
        },

        shell: {
            coverage: {
                options: {
                    stdout: true,
                    stderr: true,
                    execOptions: {
                        cwd: './'
                    }
                },
                command: [
                    'jscoverage lib lib-cov',
                    'mv lib lib-bak',
                    'mv lib-cov lib',
                    'mocha tests -R json-cov | node scripts/coverage.js',
                    'mocha tests -R html-cov > coverage.html',
                    'rm -rf lib',
                    'mv lib-bak lib'
                ].join('&&')
            }
        },

        mochaTest: {
            options: {
                reporter: 'dot'
            },
            src: ['tests/*-spec.js']
        }
    })


    grunt.registerTask('default', ['jshint', 'test', 'coverage'])
    grunt.registerTask('test', ['mochaTest'])
    grunt.registerTask('coverage', ['shell:coverage'])
};
