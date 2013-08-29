'use strict';

/**
 * Return the RedisTransporter generator
 * @param {Redis} redisInstance
 * @returns {{get: function, set: function, purge: function}}
 */
module.exports = function(redisInstance) {
    if (!redisInstance) {
        throw new Error('Cannot init requestify redis transporter without redis instance');
    }

    /**
     * Redis instance
     * @type {Redis}
     */
    var redis = redisInstance;

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

    /**
     * Callback handler
     * @param {Function} callback
     * @returns {Function}
     */
    function callbackHandler(callback) {
        return function(error, data) {
            if (data === 'OK') {
                callback();
                return;
            }

            callback(error, deserializeResponse(data));
        };
    }

    return {

        /**
         * @implements Cache.get
         * @param {string} url
         * @param {Function} callback
         */
        get: function(url, callback) {
            redis.get(url, callbackHandler(callback));
        },

        /**
         * @implements Cache.set
         * @param {string} url
         * @param {string} response
         * @param {Function} callback
         */
        set: function(url, response, callback) {
            redis.set(url, serializeResponse(response), callbackHandler(callback));
        },

        /**
         * @implements Cache.purge
         * @param {string} url
         * @param {Function} callback
         */
        purge: function(url, callback) {
            redis.del(url, callbackHandler(callback));
        }
    };
};