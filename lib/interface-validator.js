/**
 * Makes sure an object in implementing the required given methods.
 */
var InterfaceValidator = (function() {
    'use strict';

    return {

        /**
         * Validates the given object implements the given interfaceArray methods
         * @param {string} interfaceName
         * @param {object} object
         * @param {array} interfaceArray
         */
        validate: function(interfaceName, object, interfaceArray) {
            if (!object) {
                throw new Error(interfaceName + ' must implement required methods and cannot be null');
            }

            interfaceArray.forEach(function(val) {
                if (typeof object[val] !== 'function') {
                    throw new Error(interfaceName + ' must implement ' + val + ' method');
                }
            });
        }
    };
}());

module.exports = InterfaceValidator;
