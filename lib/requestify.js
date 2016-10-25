/**
 * Module dependencies
 */
var http = require('http'),
    Request = require('./request'),
    Response = require('./response'),
    Q = require('q'),
    cache = require('./cache'),
    https = require('https'),
    logger = require('./logger'),
    redisTransporter = require('./cache-transporters/redis-transporter'),
    inMemoryTransporter = require('./cache-transporters/in-memory-transporter'),
    mongoTransporter = require('./cache-transporters/mongo-transporter');

var Requestify = (function() {
    'use strict';

    /**
     * The response encoding
     * @type {string}
     */
    var responseEncoding = 'utf8',

        /**
         * Module API
         */
            api;

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
     * Is the request was successful or not
     * @param {number} code
     * @returns {boolean}
     */
    function isSuccessful(code) {
        return (code >= 200 && code < 300);
    }

    /**
     * Uses Requestify cache service to store response cache
     * @param {string} url
     * @param {int} code
     * @param {headers} headers
     * @param {string|object} body
     * @param {{cache: boolean, expires: number}} cacheSettings
     */
    function storeCache(url, code, headers, body, cacheSettings) {
        cacheSettings = cacheSettings || { cache: false };

        if (!cacheSettings.cache) {
            return;
        }

        cache.set(url, {
            code: code,
            headers: headers,
            body: body,
            created: new Date().getTime()
        });
    }

    /**
     * Executes the given request object.
     * @param {Request} request
     * @param {Q.defer} defer
     */
    function call(request, defer) {
        var httpRequest,
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
            headers: request.getHeaders(),
            redirect : request.getRedirect()
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
                if (isSuccessful(response.code)) {
                    storeCache(request.getFullUrl(), response.getCode(), response.getHeaders(), response.body, request.cache);
                    defer.resolve(response);
                    return;
                }

                if (request.redirect && isRedirect(response.code)) {
                    request.url = response.getHeaders().location;
                    return call(request, defer);
                }
                defer.reject(response);
            });
        });

        /**
         * Abort and reject on timeout
         */
        timeout = setTimeout(function() {
            httpRequest.abort();
            defer.reject(new Response(405, {}, 'timeout exceeded'));
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

function isRedirect(statusCode) {
    return statusCode === 301 || statusCode === 302 ||  statusCode === 303 || statusCode === 304 || statusCode === 307;
}
    /**
     * Request router, handles caching
     * @param {Request} request
     * @returns {Q.promise}
     */
    function callRouter(request) {
        var defer = Q.defer();

        if (!cache.isTransportAvailable() || request.method !== 'GET' || request.cache.cache === false) {
            return call(request, defer);
        }

        function expirationTime(data) {
            return data.created + request.cache.expires;
        }

        /**
         * Get the cache and serve if available
         */
        cache.get(request.getFullUrl())
            .then(function(data) {
                if (!data || (expirationTime(data) <= new Date().getTime())) {
                    call(request, defer);
                    return;
                }

                defer.resolve(new Response(data.code, data.headers, data.body));
            })
            .fail(function() {
                call(request, defer);
            }
        );

        return defer.promise;
    }

    /**
     * Module API
     * @type {{request: Function, responseEncoding: Function, get: Function, post: Function, put: Function, delete: Function, head: Function }}
     */
    api = {
        /**
         * Execute HTTP request based on the given method and body
         * @param {string} url - The URL to execute
         * @param {{ method: string, dataType: string, headers: object, body: object, cookies: object, auth: object }} options
         * @returns {Q.promise} - Returns a promise, once resolved || rejected, Response object is given
         */
        request: function(url, options) {
            return callRouter(new Request(url, options));
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
        },

        /**
         * Getter/Setter for the redis instance
         * @deprecated
         * @param {Redis} redisInstance
         */
        redis: function(redisInstance) {
            if (!redisInstance) {
                return;
            }

            this.cacheTransporter(redisTransporter(redisInstance));
        },

        /**
         * Module core transporters
         */
        coreCacheTransporters: {
            redis: redisTransporter,
            mongo: mongoTransporter,
            inMemory: inMemoryTransporter
        },

        /**
         * Module core log adapters
         */
        coreLoggerAdapters: {
            console: require('./logger-adapters/console-adapter'),
            winston: require('./logger-adapters/winston-adapter')
        },

        /**
         * Set cache transporter
         * @param {{ get: function, set: function, purge: function }} cacheTransporter
         */
        cacheTransporter: function(cacheTransporter) {
            if (!cacheTransporter) {
                return;
            }

            cache.setCacheTransporter(cacheTransporter);
        },

        /**
         * Set custom log adapter
         * @param {{ error: function, info: function, debug: function, warning: function }} logAdapter
         */
        logAdapter: function(logAdapter) {
            if (!logAdapter) {
                return;
            }

            logger.setLogger(logAdapter);
        },

        /**
         * Proxy function for determining logging level
         * @param {number} level - Number between 0 - 3 (e.g. 0 - error, 1 - warn, 2 - info, 3 - debug)
         */
        logLevel: function(level) {
            if (isNaN(level)) {
                throw new Error('Level must be a number');
            }

            logger.logLevel(level);
        }
    };

    /**
     * Short methods generator
     */
    (function createShortMethods(names) {
        names.forEach(function(name) {
            api[name] = function(url, options) {
                options = options || {};
                options.method = name.toUpperCase();

                return api.request(url, options);
            };
        });
    }(['get', 'delete', 'head']));

    /**
     * Short methods with data generator
     */
    (function createShortMethodsWithData(names) {
        names.forEach(function(name) {
            api[name] = function(url, data, options) {
                options = options || {};

                options.method = name.toUpperCase();
                options.body = data;

                return api.request(url, options);
            };
        });
    }(['post', 'put']));

    return api;
}());

module.exports = Requestify;
