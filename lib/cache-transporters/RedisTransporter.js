'use strict';

module.exports = function(redisInstance) {
    var redis = redisInstance;

    function callbackHandler(callback) {
        return function(error, data) {
            callback(error, data);
        };
    }

    return {
        get: function(url, callback) {
            redis.get(url, callbackHandler(callback));
        },

        set: function(url, response, callback) {
            redis.set(url, response, callbackHandler(callback));
        },

        purge: function(url, callback) {
            redis.del(url, callbackHandler(callback));
        }
    };
};