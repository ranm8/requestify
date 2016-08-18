'use strict';

module.exports = function() {
  var cache = {};

  return {
    /**
     * @implements Cache.get
     * @param {string} url
     * @param {Function} callback
     */
    get: function(url, callback) {
      callback(null, cache[url]);
    },

    /**
     * @implements Cache.set
     * @param {string} url
     * @param {string} response
     * @param {Function} callback
     */
    set: function(url, response, callback) {
        cache[url] = response;
        callback();
    },

    /**
     * @implements Cache.purge
     * @param {string} url
     * @param {Function} callback
     */
    purge: function(url, callback) {
        delete cache[url];
        callback();
    }
  };
};
