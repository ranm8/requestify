var _ = require('underscore'),
    http = require('http'),
    Request = require('./Request.js'),
    Response = require('./Response.js'),
    Q = require('q'),
    https = require('https');

var HttpRequest = (function(global, undefined) {
    'use strict';

    /**
     * The response encoding
     * @type {string}
     */
    var responseEncoding = 'utf8',
        /**
         * Module's supported methods
         * @type {Array}
         */
         supportedMethods = [
            'HEAD',
            'POST',
            'GET',
            'PUT',
            'DELETE'
        ],

        /**
         * Module's supported data types
         * @type {Array}
         */
        supportedDataTypes = [
            'json',
            'form-url-encoded'
        ];

    /**
     * Builds Request object from the given body
     * @param {string} url - The URL to execute
     * @param {string} method - HTTP method
     * @param {object} body - Key value pairs of body body (will be encoded according to given dataType)
     * @param {object} headers - Key value pairs of HTTP headers
     * @param {object} cookies - Key value pairs of cookies (later ecnoded to Cookies header string)
     * @param {string} dataType - The request dataType (currently supports json and x-www-urlencoded)
     * @param {{ username: string, password: string }} auth - Object contains the user name and password to attach to the Authorization request header as Basic
     * @returns {Request}
     */
    function buildRequest(url, method, body, headers, cookies, dataType, auth) {
        var request = new Request(url, method, body, headers, dataType, auth);

        if (cookies) {
            request.cookies(cookies);
        }

        return request;
    }

    /**
     * Returns http|s instance according to the given protocol
     * @param protocol
     * @returns {http|https}
     */
    function getHttp(protocol) {
        if (protocol === 'https:') {
            return https;
        }

        return http;
    }

    /**
     * Executes the given request object.
     * @param {Request} request
     * @returns {Q.promise} - Returns a promise with Response object on resolve
     */
    function call(request) {
        var defer = Q.defer(),
            httpRequest,
            options,
            http = getHttp(request.getProtocol());

        options = {
            hostname: request.getHost(),
            path: request.getUri(),
            port: request.getPort(),
            method: request.method,
            headers: request.getHeaders()
        };

        httpRequest = http.request(options, function(res) {
            var response = new Response(res.statusCode, res.headers);

            res.setEncoding(responseEncoding);
            res.on('data', function(chunk) {
                response.setChunk(chunk);
            });

            res.on('end', function() {
                defer.resolve(response);
            });
        });

        httpRequest.on('error', function(error) {
            defer.reject(error);
        });

        httpRequest.end(request.getBody());

        return defer.promise;
    }

    /**
     * Return public API
     */
    return {

        /**
         * Execute GET HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ dataType: string, headers: object, body: object, cookies: object }} options - HTTP method
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        get: function(url, options) {
            options.method = 'GET';

            return this.request(url, options);
        },

        /**
         * Execute POST HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ dataType: string, headers: object, body: object, cookies: object }} options - HTTP method
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        post: function(url, options) {
            options.method = 'POST';

            return this.request(url, options);
        },

        /**
         * Execute DELETE HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ dataType: string, headers: object, body: object, cookies: object }} options - HTTP method
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        del: function(url, options) {
            options.method = 'DELETE';

            return this.request(url, options);
        },

        /**
         * Execute HEAD HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ dataType: string, headers: object, body: object, cookies: object }} options - HTTP method
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        put: function(url, options) {
            options.method = 'PUT';

            return this.request(url, options);
        },


        /**
         * Execute HEAD HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ dataType: string, headers: object, body: object, cookies: object }} options - HTTP method
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        head: function(url, options) {
            options.method = 'HEAD';

            return this.request(url, options);
        },

        /**
         * Execute HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ method: string, dataType: string, headers: object, body: object, cookies: object, auth: object }} options - HTTP method
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        request: function(url, options) {
            var method = options.method || 'GET',
                dataType = options.dataType,
                headers = options.headers || {},
                body = options.body || {},
                cookies = options.cookies || {},
                auth = options.auth || null;


            if (supportedMethods.indexOf(method) === -1) {
                throw new Error('Method ' + method + ' is not supported');
            }

            return call(buildRequest(url, method, body, headers, cookies, dataType, auth));
        },

        /**
         * Getter/setter for the response encoding
         * @param {string} value
         * @returns {string|this}
         */
        responseEncoding: function(value) {
            if (!value) {
                return responseEncoding;
            }

            responseEncoding = value;
            return this;
        }
    };
}(global));

module.exports = HttpRequest;