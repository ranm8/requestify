'use strict';

/**
 * Test dependencies
 */
var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    interfaceValidator = rewire('../lib/interface-validator');

describe('InterfaceValidator', function() {

    /**
     * Valid mock object
     * @type {{get: Function, set: Function, doThat: Function}}
     */
    var mockValidObject = {
            get: function(){},
            set: function(){},
            doThat: function(){}
        },

        /**
         * Invalid mock object
         */
            mockInvalidObject = {
            get: {},
            set: function(){}
        },

        /**
         * Mock interface array
         */
            mockInterface = ['get', 'set', 'doThat'];

    describe('#validate()', function() {

        it('should throw an error with the interface name if null or an empty value was provided', function() {
            expect(function() {
                interfaceValidator.validate('SomeInterface', null, mockInterface);
            }).to.throw('SomeInterface must implement required methods and cannot be null');
        });

        it('should throw an error with the interface name if one or more methods were not implemented', function() {
            expect(function() {
                interfaceValidator.validate('SomeInterface', mockInvalidObject, mockInterface);
            }).to.throw('SomeInterface must implement get method');
        });

        it('should return undefined without throwing any error if everything is OK', function() {
            expect(interfaceValidator.validate('SomeInterface', mockValidObject, mockInterface)).to.equal(undefined);
        });

    });
});
