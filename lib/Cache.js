/**
 * Module dependencies
 */
var Q = require('q');

/**
 * Http Cache manager for requestify
 */
var Cache = (function() {
    'use strict';

    /**
     * Cache transporter instance
     * @type {{ get: function, set: function, purge: function }}
     */
    var transport = null,

        /**
         * Mandatory public methods for the transport interface
         * @type {array}
         */
        transportInterface = [
            'get',
            'set',
            'purge'
        ];

    /**
     * Make sure given transporter implement given transport interface
     * @param {{ get: function, set: function, purge: function }} transport
     */
    function validateTransporter(transport) {
        if (!transport) {
            throw new Error('Transporter must implement required methods and cannot be null');
        }

        transportInterface.forEach(function(val) {
            if (typeof transport[val] !== 'function') {
                throw new Error('Transporter must implement ' + val + ' method');
            }
        });
    }

    /**
     * Handles transporter callback
     * @param {Q.defer} defer
     * @returns {Function}
     */
    function callbackHandler(defer) {
        return function(error, data) {
            if (error) {
                defer.reject(error);
                return;
            }

            if (!data) {
                defer.resolve();
                return;
            }

            defer.resolve(data);
        };
    }

    /**
     * Executes transport method with given params
     * @param {string} method
     * @param {string} url
     * @param {{code: number, body: string, headers: object}} response
     * @returns {Q.promise}
     */
    function transportExecute(method, url, response) {
        var defer = Q.defer();

        if (response) {
            transport[method](url, response, callbackHandler(defer));
            return defer.promise;
        }

        transport[method](url, callbackHandler(defer));

        return defer.promise;
    }

    return {

        /**
         * Sets cache by resource URL
         * @param {string} url
         * @param {{code: number, body: string, headers: object}} response
         * @returns {Q.promise}
         */
        set: function(url, response) {
            return transportExecute('set', url, response);
        },

        /**
         * Returns cache by resource URL
         * @param {string} url
         * @returns {Q.promise}
         */
        get: function(url) {
            return transportExecute('get', url);
        },

        /**
         * Purges a specific cache by URL
         * @param url
         * @returns {Q.promise}
         */
        purge: function(url) {
            return transportExecute('purge', url);
        },

        /**
         * Sets redis client
         * @param {{ get: function, set: function, purge: function }} cacheTransporter
         * @returns {Cache}
         */
        setCacheTransporter: function(cacheTransporter) {
            validateTransporter(cacheTransporter);
            transport = cacheTransporter;

            return this;
        },

        /**
         * Determines if transport is currently available for use
         * @returns {boolean}
         */
        isTransportAvailable: function() {
            return transport !== null;
        }

    };
}());

module.exports = Cache;