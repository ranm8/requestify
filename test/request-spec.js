'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    Request = rewire('../lib/request.js'),
    queryString = require('querystring');

describe('Request', function() {

    describe('constructor', function() {
        it('Should throw an error if URL is not provided', function() {
            expect(Request).to.throw(Error);
        });

        it('Should construct the object with the all properties assigned', function() {
            var url = 'http://www.google.com/hello/world',
                params = {
                    foo: 'bar',
                    bar: 'foo'
                },
                headers = {
                    'Accept': 'application/json'
                },
                request = new Request(url, {
                    method: 'GET',
                    body: params,
                    headers: headers,
                    dataType: 'json',
                    cookies: {},
                    auth: {}
                });

            expect(request.url).to.equal(url);
            expect(request.headers).to.equal(headers);
            expect(request.body).to.equal(params);
            expect(request.dataType).to.equal('json');
            expect(request.timeout).to.equal(30000); // default timeout
        });
    });

    describe('URL getters', function() {
        var request;

        beforeEach(function() {
            request = new Request('http://www.google.com/hello/world', {
                method: 'GET'
            });
        });

        afterEach(function() {
            request = null;
        });

        describe('#getUrlParts()', function() {
            it ('Should parse and cache the parsed url parts object', function() {
                var request = new Request('http://www.google.com/hello/world', {
                    method: 'GET'
                });

                request.getUrlParts();
                expect(request.urlParts).to.be.a('object');
                expect(request.urlParts.host).to.be.a('string');
            });

            it('Should throw an error if URL is invalid', function() {
                var request = new Request('foo.bar', { method: 'GET' });
                expect(request.getUrlParts).to.throw(Error);
            });
        });

        describe('#getPort()', function() {
            it ('Should be 80 (default port)', function() {

                // defaults port is 80, when no other mentioned 80 it is
                expect(request.getPort()).to.equal(80);
            });

            it('Should be port 8080', function() {
                var request = new Request('http://www.google.com:8080/hello/world', { method: 'GET' });

                expect(request.getPort()).to.equal('8080');
            });
        });

        describe('#getPath()', function() {
            it('should be set to the given path option value', function() {
                var request = new Request('http://www.google.com:8080/hello/world', { method: 'GET', path: 'http://www.google.com/foo/bar' });

                expect(request.getPath()).to.equal('http://www.google.com/foo/bar');
            });

            it('should be set to null, path not given', function() {
                var request = new Request('http://www.google.com:8080/hello/world', { method: 'GET' });

                expect(request.getPath()).to.be.null;
            });
        });

        describe('#getHost()', function() {
            it('Host should be a string', function() {
                expect(request.getHost()).to.be.a('string');
            });
        });

        describe('#getUri()', function() {
            it('Should return the URI without any query string', function() {
                expect(request.getUri()).to.equal('/hello/world');
            });

            it('Should return the URI with basic query string added', function() {
                var path = '/wix/new?hi=foo&bar=hey',
                    request = new Request('http://www.google.com' + path, { method: 'GET' });

                expect(request.getUri()).to.equal(path);
            });

            it('Should return the URI with the body as query string', function() {
                var params = {
                        foo: 'bar',
                        bar: 'foo'
                    },
                    request = new Request('http://www.wix.com', {
                        method: 'GET',
                        params: params
                    });

                expect(request.getUri()).to.equal('/?' + queryString.encode(params));
            });

            it('Should return the URI with both body and exising query string', function() {
                var params = {
                        foo: 'bar',
                        bar: 'foo'
                    },
                    path = '/?anakin=skywalker',
                    request = new Request('http://www.wix.com' + path, {
                        method: 'GET',
                        params: params
                    });

                expect(request.getUri()).to.equal(path + '&' + queryString.encode(params));
            });
        });
    });

    describe('Body encoding', function() {
        var params = { hello: 'world', world: 'hello' },
            request;

        beforeEach(function() {
            request = new Request('http://www.wix.com', {
                method: 'POST',
                body: params
            });
        });

        afterEach(function() {
            request = null;
        });

        describe('#getJsonBody()', function() {
            it('Should return json encoded body from the constructor given body object', function() {
                expect(request.getJsonBody()).to.equal(JSON.stringify(params));
            });
        });

        describe('#getUrlEncodedBody()', function() {
            it('Should return URL encoded body from the constructor given body object', function() {
                expect(request.getUrlEncodedBody()).to.equal(queryString.encode(params));
            });
        });

        describe('#getBody()', function() {
            it('Should return encoded body according to constructor given data type - currently json (default)', function() {
                expect(request.getBody()).to.equal(JSON.stringify(params));
            });

            it('Should return encoded body according to given data type url encoded', function() {
                var request = new Request('http://www.wix.com', {
                    method: 'POST',
                    body: params,
                    headers: {},
                    dataType: 'form-url-encoded'
                });

                expect(request.getBody()).to.equal(queryString.encode(params));
            });
        });
    });

    describe('Headers', function() {
        var params = { hello: 'world', world: 'hello' },
            headers = { 'Accept': 'application/json', 'Some-Header': 'header-value' },
            cookies = {
                'some-cookie': 'some-cookie-value',
                'another-cookie': 'another-cookie-value'
            },
            request;

        beforeEach(function() {
            request = new Request('http://www.wix.com', {
                method: 'POST',
                body: params,
                headers: headers
            });
        });

        afterEach(function() {
            request = null;
        });

        describe('#cookies()', function() {

            it('Should add the cookie to the request object', function() {

                request.cookies(cookies);
                expect(request.cookies()).to.equal(cookies);
            });
        });

        describe('#getConentLength()', function() {

            it('Return the current request content length', function() {
                expect(request.getContentLength()).to.equal(33);
            });

            it('Return 0 if request is based on GET method', function() {
                var request = new Request('http://www.wix.com', {
                    method: 'GET',
                    body: params
                });

                expect(request.getContentLength()).to.equal(0);
            });
        });

        describe('#getCookiesHeader', function() {
            it('Should return a valid cookies string with the given body', function() {
                request.cookies(cookies);

                expect(request.getCookiesHeader()).to.equal('some-cookie=some-cookie-value; another-cookie=another-cookie-value; ');
            });

            it('Should return null since no cookies exists', function() {
                expect(request.getCookiesHeader()).to.equal(null);
            });
        });

        describe('#getHeaders()', function() {
            it ('Should return set of default headers along with the requested ones', function() {
                request.cookies(cookies);

                expect(request.getHeaders()).to.deep.equal({
                    'Cookie': 'some-cookie=some-cookie-value; another-cookie=another-cookie-value; ',
                    'User-Agent': 'node/http-request-lib/v0.1',
                    'Content-Type': 'application/json',
                    'Some-Header': 'header-value',
                    'Content-Length': 33,
                    'Accept': 'application/json'
                });
            });
        });

        describe('#getAuthorization()', function() {
            it('Should return null', function() {
                expect(request.getAuthorization()).to.equal(null);
            });

            it('Should return auth string for username: anakin and password: skywalker', function() {
                var request = new Request('http://www.wix.com', {
                    method: 'POST',
                    body: params,
                    headers: headers,
                    auth: {
                        username: 'anakin', password: 'skywalker'
                    }
                });

                expect(request.getAuthorization()).to.equal('anakin:skywalker');
            });
        });
    });
});
