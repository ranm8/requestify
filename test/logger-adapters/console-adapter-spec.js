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

    var consoleMock,

        loggerInstance,

        mockMessage = {
            request: {
                body: 'bla'
            },

            response: {
                body: 'bla'
            }
        };

    function getConsoleMock() {
        return {
            error: sinon.stub(),
            info: sinon.stub(),
            debug: sinon.stub(),
            warning: sinon.stub()
        };
    }

    beforeEach(function() {
        consoleMock = getConsoleMock();
        loggerInstance = consoleAdapter(consoleMock);
    });

    describe('#error()', function() {
        loggerInstance.error(mockMessage);

        expect(consoleMock.error).to.have.been.calledWith();
    });

    describe('#warning()', function() {

    });

    describe('#debug()', function() {

    });

    describe('#info()', function() {

    });
});
