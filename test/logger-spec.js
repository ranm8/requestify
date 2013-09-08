'use strict';

/**
 * Test dependencies
 */
var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    logger = rewire('../lib/logger.js');

describe('Logger', function() {

    /**
     * Interface validator mock
     */
    var interfaceValidator,

        /**
         * Mock adapter
         */
        adapter,

        /**
         * Interface array mock
         */
        interfaceMock = [
            'error',
            'info',
            'debug',
            'warning'
        ];

    /**
     * Returns logger adapter mock
     * @returns {{error: *, info: *, warning: *, debug: *}}
     */
    function getLoggerAdapterMock() {
        return {
            error: sinon.stub(),
            info: sinon.stub(),
            warning: sinon.stub(),
            debug: sinon.stub()
        };
    }

    /**
     * Returns mock interface validator object
     * @returns {{validate: *}}
     */
    function getInterfaceValidatorMock() {
        return {
            validate: sinon.stub()
        };
    }

    beforeEach(function() {
        interfaceValidator = getInterfaceValidatorMock();
        logger.__set__('interfaceValidator', interfaceValidator);
    });

    describe('configuration', function() {
        describe('#setLogger()', function() {

            /**
             * The logger interface name
             * @type {string}
             */
            var interfaceName = 'LoggerInterface';

            it('should call the validate method with the given adapter, interface and name', function() {
                var mock = getLoggerAdapterMock();
                logger.setLogger(mock);

                expect(interfaceValidator.validate.calledWith(interfaceName, mock, interfaceMock)).to.equal(true);
            });

            it('should return it self for chaining', function() {
                expect(logger.setLogger(getLoggerAdapterMock())).to.equal(logger);
            });

            it('try calling the API without setting an adapter will do nothing', function() {
                expect(logger.error('hey')).to.equal(undefined);
            });
        });
    });

    describe('module api', function() {

        /**
         * Object message mock
         */
        var objectMessage = {
            msg: 'The force was not found..'
        };

        /**
         * Set a mock adapter before every test
         */
        beforeEach(function() {
            adapter = getLoggerAdapterMock();
            logger.setLogger(adapter);
        });

        describe('#error()', function() {
            it('should call the adapter error method with the message', function() {
                logger.error(objectMessage);

                expect(adapter.error.calledWith(objectMessage));
            });
        });

        describe('#warning()', function() {
            it('should call the adapter warning method with the message', function() {
                logger.error(objectMessage);

                expect(adapter.warning.calledWith(objectMessage));
            });
        });

        describe('#info()', function() {
            it('should call the adapter info method with the message', function() {
                logger.error(objectMessage);

                expect(adapter.info.calledWith(objectMessage));
            });
        });

        describe('#debug()', function() {
            it('should call the adapter debug method with the message', function() {
                logger.error(objectMessage);

                expect(adapter.debug.calledWith(objectMessage));
            });
        });

        describe('#logLevel()', function() {
            it('should be 0 (error) by default', function() {
                expect(logger.logLevel()).to.equal(0);
            });

            it('should throw an error if an invalid logging level was given', function() {
                expect(function() {
                    logger.logLevel(4);
                }).to.throw('4 is not a valid logging level');
            });

            it('should return itself if log level was set successfully', function() {
                expect(logger.logLevel(2)).to.have.property('logLevel');
            });

            it('should return the current logging level I\'ve set after changing the log level successfully', function() {
                logger.logLevel(1);

                expect(logger.logLevel()).to.equal(1);
            });
        });
    });
});
