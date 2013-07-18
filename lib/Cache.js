/**
 * Module dependencies
 */
var Q = require('q');

/**
 * Http Cache manager for requestify
 * @TODO support caching transports
 */
var Cache = (function() {
    'use strict';

    /**
     * Cache transporter instance
     * @type {{ get: function, set: function, purge: function }}
     */
    var transport = null,

        /**
         * Mandatory methods for the transport interface
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
        transportInterface.forEach(function(val) {
            if (typeof transport[val] !== 'function') {
                throw new Error('Transporter must implement ' + val + ' method');
            }
        });
    }

    /**
     * Returns serialized to string version of the response object
     * @param {{code: number, body: string, headers: object}} response
     * @returns {string}
     */
    function serializeResponse(response) {
        return JSON.stringify(response);
    }

    /**
     * Deserialize a response string saved to redis
     * @param {string} response
     * @returns {object}
     */
    function deserializeResponse(response) {
        return JSON.parse(response);
    }

    return {

        /**
         * Sets cache by resource URL
         * @param {string} url
         * @param {{code: number, body: string, headers: object}} response
         * @returns {Q.promise}
         */
        set: function(url, response) {
            var defer = Q.defer();

            if (!transport) {
                defer.reject('Transport must be set on module configuration');
                return defer.promise;
            }

            transport.set(url, serializeResponse(response), function() {
                defer.resolve();
            });

            return defer.promise;
        },

        /**
         * Returns cache by resource URL
         * @param {string} url
         * @returns {Q.promise}
         */
        get: function(url) {
            var defer = Q.defer();

            if (!transport) {
                defer.reject('Transport must be set on module configuration');
                return defer.promise;
            }

            transport.get(url, function(err, data) {
                if (err) {
                    defer.reject(err);
                    return;
                }

                defer.resolve(deserializeResponse(data));
            });

            return defer.promise;
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
        }
    };
}());

module.exports = Cache;