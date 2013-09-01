'use strict';

module.exports = function(winstonInstance) {
    if (!winstonInstance) {
        throw new Error('winston instance must be set.');
    }

    return {

        /**
         * Reports error to winston
         * @param message
         */
        error: function(message) {
            winstonInstance.error(message);
        },

        /**
         * Reports info message to winston
         * @param message
         */
        info: function(message) {
            winstonInstance.info(message);
        },

        /**
         * Reports a debug level message to winston
         * @param message
         */
        debug: function(message) {
            winstonInstance.debug(message);
        },

        /**
         * Reports a warning level message to winston
         * @param message
         */
        warning: function(message) {
            winstonInstance.warning(message);
        }
    };
};
