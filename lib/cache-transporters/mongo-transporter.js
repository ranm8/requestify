'use strict';

/**
 * Return the MongoTransporter generator
 * @param {Object} mongooseInstance
 * @param {String} cacheCollection
 * @returns {{get: function, set: function, purge: function}}
 */
module.exports = function (mongooseInstance, cacheCollection) {
    if (!mongooseInstance) {
        throw new Error('Cannot init requestify mongo transporter without mongoose instance');
    }

    /**
     * mongoose instance
     * @type {Object}
     */
    var mongoose = mongooseInstance;

    /**
     * Cache collection
     * @type {string}
     */
    var cacheCollection = cacheCollection || 'requestifyresponses';

    /**
     * Cache schema
     * @type {mongoose.Schema}
     */
    var cacheSchema = new mongoose.Schema({
        _id: {
            type: String
        },
        response: {
            type: {
                code: Number,
                body: String,
                headers: Object
            }
        }
    });

    /**
     * Cache model
     * @type {mongoose.Model}
     */
    var RequestifyResponse = mongoose.model('RequestifyResponse', cacheSchema, cacheCollection);


    return {

        /**
         * @implements Cache.get
         * @param {string} url
         * @param {Function} callback
         */
        get: function(url, callback) {
            RequestifyResponse.findById(url, function (err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result.response);
            });
        },

        /**
         * @implements Cache.set
         * @param {string} url
         * @param {string} response
         * @param {Function} callback
         */
        set: function(url, response, callback) {
            var requestifyResponse = {
                _id: url,
                response: response
            };

            RequestifyResponse.create(requestifyResponse, callback);

            return requestifyResponse;
        },

        /**
         * @implements Cache.purge
         * @param {string} url
         * @param {Function} callback
         */
        purge: function(url, callback) {
            RequestifyResponse.findByIdAndRemove(url, callback);
        }
    };
};
