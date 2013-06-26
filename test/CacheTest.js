var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    cache = rewire('../lib/Cache');

(function() {
    'use strict';

    describe('Cache', function() {
        var redisMock,
            deferMock;

        beforeEach(function() {
            redisMock = {
                set: sinon.stub(),
                get: sinon.stub()
            };
            deferMock = {
                resolve: sinon.stub(),
                reject: sinon.stub()
            };

            cache.__set__('redis', redisMock);
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

        describe('#get()', function() {
            it('should reject because no redis instance was set', function() {
                cache.get('http://www.google.com');

                expect(deferMock.reject.calledWith('Redis instance must be set on module configuration')).to.equal(true);
            });

            it('should call get with the cached full url as key', function() {
                cache.setRedis(redisMock);

                var url = 'http://www.google.com';
                cache.get(url);

                expect(redisMock.get.calledWith(url)).to.equal(true);
            });
        });

        describe('#set()', function() {
            it('should reject because no redis instance was set', function() {
                cache.setRedis(null);
                cache.set('http://www.google.com', {code: 200});

                expect(deferMock.reject.calledWith('Redis instance must be set on module configuration')).to.equal(true);
            });

            it('should call get with the cached full url as key', function() {
                cache.setRedis(redisMock);

                var url = 'http://www.google.com',
                    data = { code: 200 };

                cache.set(url, data);

                expect(redisMock.set.calledWith(url, JSON.stringify(data))).to.equal(true);
            });

        });

    });
}());
