'use strict';

/**
 * Test dependencies
 */
var mocha = require('mocha'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    winstonAdapter = rewire('../../lib/logger-adapters/winston-adapter');

chai.use(require('sinon-chai'));

describe('WinstonAdapter', function() {

    /**
     * Winston mock
     */
    var winstonMock,

        /**
         * General message mock
         */
        mockMessage = {
            message: 'hey'
        },

        /**
         * Instance of the adapter object
         */
        adapterInstance;

    describe('configuration', function() {
        it('should throw an error is an empty object was given', function() {
            expect(function() {
                winstonAdapter(null);
            }).to.throw('winston instance must be set.');
        });
    });

    /**
     * Returns a winston mock object
     * @returns {{error: *, debug: *, info: *, warning: *}}
     */
    function getWinstonMock() {
        return {
            error: sinon.stub(),
            debug: sinon.stub(),
            info: sinon.stub(),
            warning: sinon.stub()
        };
    }

    beforeEach(function() {
        winstonMock = getWinstonMock();
        adapterInstance = winstonAdapter(winstonMock);
    });

    describe('#error()', function() {
        it('should call winston.error and log the given message', function() {
            adapterInstance.error(mockMessage);

            expect(winstonMock.error).have.been.calledWith(mockMessage);
        });
    });

    describe('#warning()', function() {
        it('should call winston.warning and log the given message', function() {
            adapterInstance.warning(mockMessage);

            expect(winstonMock.warning).have.been.calledWith(mockMessage);
        });
    });

    describe('#debug()', function() {
        it('should call winston.debug and log the given message', function() {
            adapterInstance.debug(mockMessage);

            expect(winstonMock.debug).have.been.calledWith(mockMessage);
        });
    });

    describe('#info()', function() {
        it('should call winston.info and log the given message', function() {
            adapterInstance.info(mockMessage);

            expect(winstonMock.info).have.been.calledWith(mockMessage);
        });
    });
});
