/**
 * Module dependencies
 */
var interfaceValidator = require('./interface-validator');

/**
 *
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
            'debug'
        ];

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

    return {
        /**
         * Logs an error message
         * @param {string|object} message
         */
        error: function(message) {
            log('error', message);
        },

        /**
         * Logs info message
         * @param {string|object} message
         */
        info: function(message) {
            log('info', message)
        },

        /**
         * Logs a debug message
         * @param message
         */
        debug: function(message) {
            log('debug', message);
        },

        /**
         * Sets a logger to log to. defaults to null (which means logs to no-where)
         * @param {string|object} loggerAdapter
         * @returns {Logger}
         */
        setLogger: function(loggerAdapter) {
            interfaceValidator.validate('LoggerInterface', loggerAdapter, adapterInterface);
            adapter = loggerAdapter;

            return this;
        }
    };
}());

module.exports = Logger;