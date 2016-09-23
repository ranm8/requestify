'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    requestify = rewire('../lib/requestify.js'),
    Q = require('q'),
    Response = require('../lib/response');

describe('Requestify', function() {
    var cacheStub,
        cachedDataStub;

    afterEach(function() {
        requestify.responseEncoding('utf8');
    });

    beforeEach(function() {
        cachedDataStub = {
            created: new Date().getTime(),
            code: 200,
            headers: 'Content-Type:application/javascript; charset=utf-8',
            body: {rock: "yeah!"}
        };
        cacheStub = {
            setCacheTransporter: sinon.stub(),
            get: sinon.stub().returns(Q.resolve(cachedDataStub)),
            // get: sinon.stub(),
            set: sinon.stub(),
            purge: sinon.stub(),
            isTransportAvailable: function() { return true }
        };

        requestify.__set__('cache', cacheStub);
    });

    describe('#responseEncoding()', function() {

        it('Should return utf8 by default', function() {
            expect(requestify.responseEncoding()).to.equal('utf8');
        });

        it('Should set the new encoding and return it on request', function() {
            requestify.responseEncoding('newEncoding');

            expect(requestify.responseEncoding()).to.equal('newEncoding');
        });
    });

    describe('#request()', function() {
        var httpStub,
            httpsStub;

        beforeEach(function() {
            httpStub = sinon.stub().returns({
                on: function() {},
                end: function() {},
                abort: function() {}
            });

            httpsStub = sinon.stub().returns({
                on: function() {},
                end: function() {},
                abort: function() {}
            });

            requestify.__set__('http', {
                request: httpStub
            });

            requestify.__set__('https', {
                request: httpsStub
            });
        });

        afterEach(function() {
            httpStub = null;
            httpsStub = null;
        });

        it('Should return a promise', function() {
            requestify.request('http://wix.com', {
                method: 'POST',
                dataType: 'json'
            });
        });

        it('Should call https module since the request is https: protocol', function() {
            requestify.request('https://wix.com', {
                method: 'POST'
            });

            expect(httpsStub.called).to.equal(true);
        });

        it('Should call http module since request is http: protocol', function() {
            requestify.request('http://wix.com', {
                method: 'POST'
            });

            expect(httpStub.called).to.equal(true);
        });

        it('Should return a promise object', function() {
            expect(requestify.request('https://wix.com', {
                method: 'POST'
            })).to.have.property('then');
        });

        it('Should return cached response before updating cache', function(done) {
            var success = sinon.spy();
            requestify.cacheTransporter();
            var response = new Response(cachedDataStub.code, cachedDataStub.headers, cachedDataStub.body);

            requestify.request('http://wix.com', {
                method: 'GET',
                cache: {
                    cache: true,
                    cachedFirst: true,
                    expires: -1 // force update
                }
            }).then((response) => {
                try {
                    expect(response).to.eql(response);
                    done();
                } catch (e) {
                    done(e);
                }
            });

            // expect(success.called).to.equal(true);
            // console.log('---- success?', success.called);
            // expect(requestify.request.called).to.equal(true);
            // expect(requestify.request.returned(cachedDataStub)).to.equal(true);
        });
    });

    describe('Method specific public methods', function() {
        beforeEach(function() {
            requestify.request = sinon.stub();
        });

        afterEach(function() {
            requestify.request = null;
        });

        describe('#get()', function() {
            it('should call #request() with then given url, cookies and method GET', function() {
                requestify.get('http://www.example.com', {
                    cookies: {
                        key: 'val'
                    }
                });

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'GET',
                    cookies: {
                        key: 'val'
                    }
                })).to.equal(true);
            });

            it('should call #request with the given url and method GET only', function() {
                requestify.get('http://www.example.com');

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'GET'
                }));
            });
        });

        describe('#post()', function() {
            it('should call #request() with then given body and method POST', function() {
                requestify.post('http://www.example.com', {
                    foo: 'bar'
                }, {
                    cookies: {
                        key: 'val'
                    }
                });

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'POST',
                    cookies: {
                        key: 'val'
                    },
                    body: {
                        foo: 'bar'
                    }
                })).to.equal(true);
            });

            it('should call #request with the given url and body in method POST', function() {
                requestify.post('http://www.example.com', {
                    'foo': 'bar'
                });

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'POST',
                    body: {
                        'foo': 'bar'
                    }
                }));
            });
        });

        describe('#put()', function() {
            it('should call #request() with then given body and method PUT', function() {
                requestify.put('http://www.example.com', {
                    foo: 'bar'
                }, {
                    cookies: {
                        key: 'val'
                    }
                });

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'PUT',
                    cookies: {
                        key: 'val'
                    },
                    body: {
                        foo: 'bar'
                    }
                })).to.equal(true);
            });
        });

        describe('#delete()', function() {
            it('should call #request() with then given body and method DELETE', function() {
                requestify.delete('http://www.example.com', {
                    cookies: {
                        key: 'val'
                    }
                });

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'DELETE',
                    cookies: {
                        key: 'val'
                    }
                })).to.equal(true);
            });
        });

        describe('#head()', function() {
            it('should call #request() with then given body and method HEAD', function() {
                requestify.head('http://www.example.com', {
                    body: {
                        key: 'val'
                    }
                });

                expect(requestify.request.calledWith('http://www.example.com', {
                    method: 'HEAD',
                    body: {
                        key: 'val'
                    }
                })).to.equal(true);
            });
        });

        describe('#cacheTransporter()', function() {
            it('should do nothing since called it without any transporter', function() {
                requestify.cacheTransporter();

                expect(cacheStub.setCacheTransporter.called).to.equal(false);
            });

            it('should call cache.setCacheTransporter with the transporter', function() {
                requestify.cacheTransporter({});

                expect(cacheStub.setCacheTransporter.called).to.equal(true);
            });
        });
    });
});
