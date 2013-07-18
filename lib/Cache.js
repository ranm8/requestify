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
     * Redis client instance
     * @type {Redis}
     */
    var redis = null;

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

            if (!redis) {
                defer.reject('Redis instance must be set on module configuration');
                return defer.promise;
            }

            redis.set(url, serializeResponse(response), function() {
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

            if (!redis) {
                defer.reject('Redis instance must be set on module configuration');
                return defer.promise;
            }

            redis.get(url, function(err, data) {
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
         * @param {Redis} redisClient
         * @returns {Cache}
         */
        setRedis: function(redisClient) {
            redis = redisClient;
            return this;
        }
    };
}());

module.exports = Cache;