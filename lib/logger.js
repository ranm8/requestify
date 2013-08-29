/**
 * Module dependencies
 */
var interfaceValidator = require('./interface-validator');

/**
 * Using the adapter pattern to log Requestify logs.
 */
var Logger = (function() {
    'use strict';

    /**
     * Current adapter
     * @type {object}
     */
    var adapter = null,

        /**
         * Interface mandatory methods to any logger adapter.
         * @type {array}
         */
        adapterInterface = [
            'error',
            'info',
            'debug',
            'warning'
        ],

        /**
         * Module API to return
         */
        api = {};

    /**
     * Logs to the adapter
     * @param {string} method
     * @param {string|object} message
     */
    function log(method, message) {
        if (!adapter) {
            return;
        }

        adapter[method](message);
    }

    /**
     * Create public log methods according to interface
     */
    adapterInterface.forEach(function(value) {
        api[value] = function(message) {
            log(value, message);
        };
    });

    /**
     * Sets a logger to log to. defaults to null (which means logs to no-where)
     * @param {string|object} loggerAdapter
     * @returns {Logger}
     */
    api.setLogger = function(loggerAdapter) {
        interfaceValidator.validate('LoggerInterface', loggerAdapter, adapterInterface);
        adapter = loggerAdapter;

        return this;
    };

    return api;
}());

module.exports = Logger;