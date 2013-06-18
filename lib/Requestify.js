/**
 * Module dependencies
 */
var _ = require('underscore'),
    http = require('http'),
    Request = require('./Request.js'),
    Response = require('./Response.js'),
    Q = require('q'),
    https = require('https');

var Requestify = (function(global, undefined) {
    'use strict';

    /**
     * The response encoding
     * @type {string}
     */
    var responseEncoding = 'utf8';

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
            http = getHttp(request.getProtocol()),
            timeout;

        // Define options according to Request object interface
        options = {
            hostname: request.getHost(),
            path: request.getUri(),
            port: request.getPort(),
            method: request.method,
            auth: request.getAuthorization(),
            headers: request.getHeaders()
        };

        /**
         * Handle request callback
         */
        httpRequest = http.request(options, function(res) {
            clearTimeout(timeout);
            var response = new Response(res.statusCode, res.headers);

            res.setEncoding(responseEncoding);
            res.on('data', function(chunk) {
                response.setChunk(chunk);
            });

            res.on('end', function() {
                defer.resolve(response);
            });
        });

        /**
         * Abort and reject on timeout
         */
        timeout = setTimeout(function() {
            httpRequest.abort();
            defer.reject('Timeout exceeded');
        }, request.timeout);

        /**
         * Reject on error and pass the given error object
         */
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
         * @param {{ method: string, dataType: string, headers: object, body: object, cookies: object, auth: object }} options
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        request: function(url, options) {
            return call(new Request(url, options));
        },

        /**
         * Getter/setter for the response encoding
         * @param {string} value
         * @returns {string|Requestify}
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

module.exports = Requestify;