'use strict';

var sinon = require('sinon'),
  expect = require('chai').expect,
  rewire = require('rewire'),
  transporter = require('../../lib/cache-transporters/in-memory-transporter');

describe('InMemoryTransporter', function() {

  var transporterInstance = null,
    mockUrl = 'http://github.com/ranm8/requestify',
    mockResponse = 'big data to cache...',
    callbackMock = sinon.stub();

  beforeEach(function() {
    transporterInstance = transporter();
  });

  function set() {
    transporterInstance.set(mockUrl, mockResponse, callbackMock);
  }

  function assertGetSuccess() {
    transporterInstance.get(mockUrl, function(err, res) {
      expect(res).to.equal(mockResponse);
      expect(err).to.equal(null);
    });
  }

  function assertGetFailure() {
    transporterInstance.get(mockUrl, function(err, res) {
      expect(res).to.equal(undefined);
    });
  }

  describe('#set()', function() {
    it('set response to memory cache', function() {
      set();
      expect(callbackMock.calledOnce).to.equal(true);
    });
  });

  describe('#get()', function() {
    it('should return the cache object for given url', function() {
      set();
      assertGetSuccess();
    });

    it('should return `undefined` in case cache for given url was not found', function() {
      assertGetFailure();
    });
  });

  describe('#purge()', function() {
    it('should remove an existing cache object by url', function() {
      var purgeCbMock = sinon.stub();
      set();
      assertGetSuccess();
      transporterInstance.purge(mockUrl, purgeCbMock);
      assertGetFailure();
      expect(purgeCbMock.calledOnce).to.equal(true);
    });
  });
});


