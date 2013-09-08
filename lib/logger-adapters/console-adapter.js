'use strict';

var console = global.console;

module.exports = function() {

    /**
     * Color definitions
     * @type {string}
     */
    var red = '\u001b[31m',
        blue = '\u001b[34m',
        yellow = '\x1B[33m',
        magenta = '\x1B[35m',
        reset = '\u001b[0m';

    /**
     * Composes a colorful message (label is colorful)
     * @param {string} color
     * @param {string} label
     * @param {object|string} message
     * @returns {string}
     */
    function composeColoredMessage(color, label, message) {
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }

        return color + label + ': ' + reset + message;
    }

    return {

        /**
         * Logs an error to the node console
         * @param {object|string} message
         */
        error: function(message) {
            console.error(composeColoredMessage(red, 'Error', message));
        },

        /**
         * Logs info log to the node console
         * @param {object|string} message
         */
        info: function(message) {
            console.info(composeColoredMessage(blue, 'Info', message));
        },

        /**
         * Logs debug to the node console
         * @param {object|string} message
         */
        debug: function(message) {
            console.log(composeColoredMessage(magenta, 'Debug', message));
        },

        /**
         * Logs warning to the node console
         * @param {object|string} message
         */
        warning: function(message) {
            console.warn(composeColoredMessage(yellow, 'Warning', message));
        }
    };
};
