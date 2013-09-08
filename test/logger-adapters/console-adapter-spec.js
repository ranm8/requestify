'use strict';

/**
 * Test dependencies
 */
var mocha = require('mocha'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    consoleAdapter = rewire('../../lib/logger-adapters/console-adapter');

chai.use(require('sinon-chai'));

describe('ConsoleAdapter', function() {

    /**
     * Mock object for the V8 console object
     */
    var consoleMock,

        /**
         * String message
         * @type {string}
         */
        stringMessage = 'some error message in a string',

        /**
         * Logger instance to test
         */
        loggerInstance,

        /**
         * Reset mock
         */
        reset = '\u001b[0m',

        /**
         * Message mock
         */
        mockMessage = {
            request: {
                body: 'bla'
            },

            response: {
                body: 'bla'
            }
        };

    /**
     * Returns a global console mock
     * @returns {{error: *, info: *, debug: *, warning: *}}
     */
    function getConsoleMock() {
        return {
            error: sinon.stub(),
            info: sinon.stub(),
            log: sinon.stub(),
            warn: sinon.stub()
        };
    }

    beforeEach(function() {
        consoleMock = getConsoleMock();
        consoleAdapter.__set__('console', consoleMock);
        loggerInstance = consoleAdapter();
    });

    describe('#error()', function() {
        var red = '\u001b[31m',
            label = 'Error: ';

        it('should call console.error with the message object encoded to JSON', function() {
            loggerInstance.error(mockMessage);

            expect(consoleMock.error).to.have.been.calledWith(red + label + reset + JSON.stringify(mockMessage));
        });

        it('should call console.error with the message string', function() {
            loggerInstance.error(stringMessage);

            expect(consoleMock.error).to.have.been.calledWith(red + label + reset + stringMessage);
        });
    });

    describe('#warning()', function() {
        var yellow = '\x1B[33m',
            label = 'Warning: ';

        it('should call console.warn with the message object encoded to JSON', function() {
            loggerInstance.warning(mockMessage);

            expect(consoleMock.warn).to.have.been.calledWith(yellow + label + reset + JSON.stringify(mockMessage));
        });

        it('should call console.warn with the message string', function() {
            loggerInstance.warning(stringMessage);

            expect(consoleMock.warn).to.have.been.calledWith(yellow + label + reset + stringMessage);
        });
    });

    describe('#debug()', function() {
        var magenta = '\x1B[35m',
            label = 'Debug: ';

        it('should call console.debug with the message object encoded to JSON', function() {
            loggerInstance.debug(mockMessage);

            expect(consoleMock.log).to.have.been.calledWith(magenta + label + reset + JSON.stringify(mockMessage));
        });

        it('should call console.debug with the message string', function() {
            loggerInstance.debug(stringMessage);

            expect(consoleMock.log).to.have.been.calledWith(magenta + label + reset + stringMessage);
        });
    });

    describe('#info()', function() {
        var blue = '\u001b[34m',
            label = 'Info: ';

        it('should call console.info with the message object encoded to JSON', function() {
            loggerInstance.info(mockMessage);

            expect(consoleMock.info).to.have.been.calledWith(blue + label + reset + JSON.stringify(mockMessage));
        });

        it('should call console.info with the message string', function() {
            loggerInstance.info(stringMessage);

            expect(consoleMock.info).to.have.been.calledWith(blue + label + reset + stringMessage);
        });
    });
});
