'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    cache = rewire('../lib/Cache');

describe('Cache', function() {
    var redisTransporterMock,
        deferMock;

    beforeEach(function() {
        redisTransporterMock = {
            set: sinon.stub(),
            get: sinon.stub(),
            purge: sinon.stub()
        };
        deferMock = {
            resolve: sinon.stub(),
            reject: sinon.stub()
        };

        cache.__set__('redis', redisTransporterMock);
        cache.__set__('Q', {
            defer: function() {
                return deferMock;
            }
        });
    });

    afterEach(function() {
        cache.__set__('redis', {});
        cache.__set__('Q', {});
    });

    describe('#isTransportAvailable()', function() {
        it('should return false, transport still not set', function() {
            expect(cache.isTransportAvailable()).to.equal(false);
        });

        it('should return true, transport was set', function() {
            cache.setCacheTransporter(redisTransporterMock);

            expect(cache.isTransportAvailable()).to.equal(true);
        });
    });

    describe('#purge()', function() {
        it('should call purge with the cached full url as key', function() {
            cache.setCacheTransporter(redisTransporterMock);

            var url = 'http://www.google.com';
            cache.get(url);

            expect(redisTransporterMock.get.calledWith(url)).to.equal(true);
        });

    });

    describe('#get()', function() {
        it('should call get with the cached full url as key', function() {
            cache.setCacheTransporter(redisTransporterMock);

            var url = 'http://www.google.com';
            cache.get(url);

            expect(redisTransporterMock.get.calledWith(url)).to.equal(true);
        });
    });

    describe('#set()', function() {
        it('should call set with the cached full url as key', function() {
            cache.setCacheTransporter(redisTransporterMock);

            var url = 'http://www.google.com',
                data = { code: 200 };

            cache.set(url, data);

            expect(redisTransporterMock.set.calledWith(url, data)).to.equal(true);
        });
    });
});

