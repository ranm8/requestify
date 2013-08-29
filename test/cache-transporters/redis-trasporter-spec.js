'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    redisTransporter = rewire('../../lib/cache-transporters/redis-transporter');

describe('RedisTransporter', function() {

    var redisMock,
        transporter,
        mockUrl = 'http://google.com';

    it('should throw an Error if redisInstance was not provided', function() {
        expect(function() {
            redisTransporter();
        }).to.throw('Cannot init requestify redis transporter without redis instance');
    });

    beforeEach(function() {
       redisMock = {
           get: sinon.stub(),
           set: sinon.stub(),
           del: sinon.stub()
       };

        transporter = redisTransporter(redisMock);
    });

    describe('#get()', function() {
        it('calls redis.get with callback and url', function() {
            transporter.get(mockUrl);

            expect(redisMock.get.calledWith(mockUrl));
        });
    });

    describe('#set()', function() {
        it('calls redis.get with callback and url', function() {
            transporter.set(mockUrl, 'some-json-string');

            expect(redisMock.get.calledWith(mockUrl, 'some-json-string'));
        });
    });

    describe('#del()', function() {
        it('calls redis.del with callback and url', function() {
            transporter.get(mockUrl);

            expect(redisMock.del.calledWith(mockUrl));
        });
    });
});