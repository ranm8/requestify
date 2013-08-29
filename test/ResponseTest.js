'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    Response = rewire('../lib/response.js');

describe('Response', function() {

    var headers = {
            'Content-Type': 'application/json',
            'Content-Length': 200,
            'Server': 'nginx'
        },
        response;

    beforeEach(function() {
        response = new Response(200, headers);
    });

    afterEach(function() {
        response = null;
    });

    describe('constructor', function() {
        it('Should include the code and header object within the object', function() {
            expect(response.code).to.equal(200);
            expect(response.headers).to.deep.equal(headers);
        });
    });

    describe('#setChunk', function() {
        it('Should build full body response from the given chunks', function(done) {
            var i = 0,
                intervalId,
                chunks = [
                    'Luke',
                    ' is',
                    ' the',
                    ' son',
                    ' of Anakin'
                ];

            intervalId = setInterval(function() {
                if (i >= chunks.length) {
                    expect(response.body).to.equal('Luke is the son of Anakin');
                    done();
                    clearInterval(intervalId);
                }

                response.setChunk(chunks[i]);
                i++;
            }, 1);
        });
    });

    describe('#getHeaders()', function() {
        it('Should return the constructed request headers', function() {
            expect(response.getHeaders()).to.deep.equal(headers);
        });
    });

    describe('#getHeader()', function() {
        it('Should return one specific header value', function() {
            expect(response.getHeader('Content-Type')).to.equal('application/json');
        });

        it('Should return null, this specific header does not exist', function() {
            expect(response.getHeader('nothing')).to.equal(null);
        });
    });

    describe('#getCode()', function() {
        it('Should return the response code constructed', function() {
            expect(response.getCode()).to.equal(200);
        });
    });
});
