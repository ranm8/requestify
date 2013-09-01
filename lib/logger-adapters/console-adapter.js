'use strict';

var console = global.console;

module.exports = function() {

    var red = '\u001b[31m',
        blue = '\u001b[34m',
        yellow = '\x1B[33m',
        magenta = '\x1B[35m',
        reset = '\u001b[0m';

    function composeColoredMessage(color, label, message) {
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }

        return color + label + ': ' + reset + message;
    }

    return {
        error: function(message) {
            console.error(composeColoredMessage(red, 'Error', message));
        },

        info: function(message) {
            console.info(composeColoredMessage(blue, 'Info', message));
        },

        debug: function(message) {
            console.log(composeColoredMessage(magenta, 'Debug', message));
        },

        warning: function(message) {
            console.warn(composeColoredMessage(yellow, 'Warning', message));
        }
    };
};
