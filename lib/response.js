'use strict';

var url = require('url'),
    queryString = require('querystring'),
    _ = require('underscore'),
    $ = require('jquery');

/**
 * Constructor to the Response object
 * @param {number} code - HTTP response code
 * @param {object} headers - Key value pairs of response headers
 * @param {string} body
 * @constructor
 */
function Response(code, headers, body) {
    this.code = code;
    this.headers = headers;
    this.body = body || '';
}

/**
 * Sets one response body chunk to the response body
 * @param {string} chunk
 * @returns {Response}
 */
Response.prototype.setChunk = function(chunk) {
    this.body += chunk;

    return this;
};

/**
 * Returns the decoded || raw string of the request
 * @returns {string|object}
 */
Response.prototype.getBody = function() {
    var responseType = this.getHeader('content-type');

    if (!responseType) {
        return this.body;
    }

    if (responseType.indexOf('application/json') !== -1 && _.isString(this.body)) {
        try {
            return JSON.parse(this.body);
        } catch(error) {
            console.log('Failed parsing expected JSON response, returned raw response');
            return this.body;
        }
    }

    if (responseType.indexOf('application/x-www-form-urlencoded') !== -1) {
        return queryString.parse(this.body);
    }

    if (responseType.indexOf('xml') !== -1) {
        return $(this.body);
    }

    return this.body;
};

/**
 * Returns the request HTTP code
 * @returns {number}
 */
Response.prototype.getCode = function() {
    return this.code;
};

/**
 * Returns one header value by key
 * @param headerKey
 * @returns {string}
 */
Response.prototype.getHeader = function(headerKey) {
    headerKey = headerKey || '';

    if (!this.headers[headerKey]) {
        return null;
    }

    return this.headers[headerKey];
};

/**
 * Returns the full headers object
 * @returns {object}
 */
Response.prototype.getHeaders = function() {
    return this.headers;
};

module.exports = Response;
