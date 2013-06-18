var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    requestify = rewire('../lib/Requestify.js'),
    Q = require('q'),
    queryString = require('querystring');

(function(global, undefined) {
    'use strict';

    describe('Requestify', function() {

        afterEach(function() {
            requestify.responseEncoding('utf8');
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
                    end: function() {}
                });

                httpsStub = sinon.stub().returns({
                    on: function() {},
                    end: function() {}
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
        });

        describe('Method specific public methods', function() {
            beforeEach(function() {
                requestify.request = sinon.stub();
            });

            afterEach(function() {
               requestify.request = null;
            });

            describe('#get()', function() {
                it('should call #request() with then given body and method GET', function() {
                    requestify.get('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(requestify.request.calledWith('http://www.wix.com', {
                        method: 'GET',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#post()', function() {
                it('should call #request() with then given body and method POST', function() {
                    requestify.post('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(requestify.request.calledWith('http://www.wix.com', {
                        method: 'POST',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#put()', function() {
                it('should call #request() with then given body and method PUT', function() {
                    requestify.put('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(requestify.request.calledWith('http://www.wix.com', {
                        method: 'PUT',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#del()', function() {
                it('should call #request() with then given body and method DELETE', function() {
                    requestify.del('http://www.wix.com', {
                        cookies: {
                            key: 'val'
                        }
                    });

                    expect(requestify.request.calledWith('http://www.wix.com', {
                        method: 'DELETE',
                        cookies: {
                            key: 'val'
                        }
                    })).to.equal(true);
                });
            });

            describe('#head()', function() {
                it('should call #request() with then given body and method HEAD', function() {
                    requestify.head('http://www.wix.com', {
                        body: {
                            key: 'val'
                        }
                    });

                    expect(requestify.request.calledWith('http://www.wix.com', {
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