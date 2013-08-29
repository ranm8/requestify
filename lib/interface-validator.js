/**
 * Makes sure an object in implementing the required given methods.
 */
var InterfaceValidator = (function() {
    'use strict';

    return {
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