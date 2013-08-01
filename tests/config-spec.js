'use strict';

var expect = require('expect.js')
var shelljs = require('shelljs')
var EventEmitter = require('events').EventEmitter;
var log = console.log

var config = require('../lib/config')


describe('Config', function() {

    beforeEach(function() {
        console.log = function() {}
    })

    afterEach(function() {
        console.log = log;
    })

    it('List config', function() {

    })

    it('List empty config', function() {

    })

    it('Write config', function(done) {
        var e = new EventEmitter();
        console.log = function(data) {
            e.emit('data', data)
        }
        config({

        })
        e.on('data', function(data) {
            expect(data)
            done()
        })
    })

    it('Delete config', function() {

    })

})
