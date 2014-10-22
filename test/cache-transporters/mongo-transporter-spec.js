'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    mongoTransporter = rewire('../../lib/cache-transporters/mongo-transporter');

describe('MongoTransporter', function() {

    var mongooseMock,
        modelMock,
        transporter,
        mockUrl = 'http://google.com';

    it('should throw an Error if mongooseInstance was not provided', function() {
        expect(function() {
            mongoTransporter();
        }).to.throw('Cannot init requestify mongo transporter without mongoose instance');
    });

    beforeEach(function() {
        modelMock = {
            findById: sinon.stub(),
            create: sinon.stub(),
            findByIdAndRemove: sinon.stub()
        };

        mongooseMock = {
            Schema: function () {},
            model: function () {
                return modelMock
            }
        };

        transporter = mongoTransporter(mongooseMock);
    });

    describe('#get()', function() {
        it('calls Model.findById with callback and url', function() {
            transporter.get(mockUrl);

            expect(modelMock.findById.calledWith(mockUrl));
        });
    });

    describe('#set()', function() {
        it('calls Model.create with {url: url, response: response} and callback', function() {
            var requestifyResponse = transporter.set(mockUrl, 'some-json-string');

            expect(modelMock.create.calledWith(requestifyResponse));
        });
    });

    describe('#del()', function() {
        it('calls Model.findByIdAndRemove with callback and url', function() {
            transporter.get(mockUrl);

            expect(modelMock.findByIdAndRemove.calledWith(mockUrl));
        });
    });
});