var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    httpRequest = rewire('../lib/HttpRequest.js'),
    Q = require('q'),
    queryString = require('querystring');

(function(global, undefined) {
    'use strict';

    describe('HttpRequest', function() {

        afterEach(function() {
            httpRequest.responseEncoding('utf8');
        });

        describe('#responseEncoding()', function() {

            it('Should return utf8 by default', function() {
                expect(httpRequest.responseEncoding()).to.equal('utf8');
            });

            it('Should set the new encoding and return it on request', function() {
                httpRequest.responseEncoding('newEncoding');

                expect(httpRequest.responseEncoding()).to.equal('newEncoding');
            });
        });

        describe('#request()', function() {
            var httpStub,
                httpsStub;

            beforeEach(function() {
                httpStub = sinon.stub().returns({
                    on: function() {},
                    end: function() {}
                });

                httpsStub = sinon.stub().returns({
                    on: function() {},
                    end: function() {}
                });

                httpRequest.__set__('http', {
                    request: httpStub
                });

                httpRequest.__set__('https', {
                    request: httpsStub
                });

            });

            afterEach(function() {
                httpStub = null;
                httpsStub = null;
            });

            it('Should throw an exception if method is not supported', function() {
                expect(function() {
                    httpRequest.request('http://google.com', {
                        method: 'PATCH'
                    });
                }).to.throw(Error, 'Method PATCH is not supported');
            });

            it('Should return a promise', function() {
                httpRequest.request('http://wix.com', {
                    method: 'POST',
                    dataType: 'json'
                });
            });

            it('Should call https module since the request is https: protocol', function() {
                httpRequest.request('https://wix.com', {
                    method: 'POST'
                });

                expect(httpsStub.called).to.equal(true);
            });

            it('Should call http module since request is http: protocol', function() {
                httpRequest.request('http://wix.com', {
                    method: 'POST'
                });

                expect(httpStub.called).to.equal(true);
            });

            it('Should return a promise object', function() {
                expect(httpRequest.request('https://wix.com', {
                    method: 'POST'
                })).to.have.property('then');
            });
        });

        describe('Method specific public methods', function() {
            beforeEach(function() {
                httpRequest.request = sinon.stub();
            });

            afterEach(function() {
               httpRequest.request = null;
            });

            describe('#get()', function() {
                it('should call #request() with then given body and method GET', function() {
                    httpRequest.get('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(httpRequest.request.calledWith('http://www.wix.com', {
                        method: 'GET',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#post()', function() {
                it('should call #request() with then given body and method POST', function() {
                    httpRequest.post('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(httpRequest.request.calledWith('http://www.wix.com', {
                        method: 'POST',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#put()', function() {
                it('should call #request() with then given body and method PUT', function() {
                    httpRequest.put('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(httpRequest.request.calledWith('http://www.wix.com', {
                        method: 'PUT',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#del()', function() {
                it('should call #request() with then given body and method DELETE', function() {
                    httpRequest.del('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(httpRequest.request.calledWith('http://www.wix.com', {
                        method: 'DELETE',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#head()', function() {
                it('should call #request() with then given body and method HEAD', function() {
                    httpRequest.head('http://www.wix.com', {
                        body: {
                            key: 'val'
                        }
                    });

                    expect(httpRequest.request.calledWith('http://www.wix.com', {
                        method: 'HEAD',
                        body: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });
        });
    });
}(global));