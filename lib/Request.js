var url = require('url'),
    queryString = require('querystring'),
    _ = require('underscore');

(function(global, undefined) {
    'use strict';

    /**
     * Constructor for the Request object
     * @param {string} url - Full endpoint URL (e.g. [protocol]://[host]/[uri]
     * @param {string} method - The request HTTP method
     * @param {object} body - Key-value object of body
     * @param {object} headers - Key-value object of headers
     * @param {string} dataType - Currently two supported dataTypes (json|form-url-encoded)
     * @param {{ username: string, password: string }} auth - Object contains the user name and password to attach to the Authorization request header
     * @constructor
     */
    function Request(url, method, body, headers, dataType, auth) {
        if (!url) {
            throw new Error('URL must in mandatory to initialize Request object');
        }

        if (!method) {
            throw new Error('Cannot execute HTTP request without specifying method');
        }

        this.url = url;
        this.method = method;
        this.body = body || {};
        this.headers = headers || {};
        this.dataType = (dataType === undefined) ? 'json' : dataType;
        this.auth = auth || {};
    }

    /**
     * Object contains the special header generators, it's an object with header name and handling function within this object (e.g. Content-Length, Authorization, etc.)
     * @type {{ headerName: string }}
     */
    Request.prototype.headerTransformers = {
        'Authorization': 'getAuthorization',
        'Content-Type': 'getContentType',
        'Cookie': 'getCookiesHeader',
        'Content-Length': 'getContentLength'
    };

    /**
     * Object of parsed URL parts
     * @type {object|null}
     */
    Request.prototype.urlParts = null;

    /**
     * Maps dataTypes to HTTP content-types
     * @type {{ dataType: string, contentType: string }}
     */
    Request.prototype.supportedDataTypes = {
        'json': 'application/json',
        'form-url-encoded': 'application/x-www-form-urlencoded'
    };

    /**
     * Default headers for each request
     * @type {{ headerKey: string }}
     */
    Request.prototype.defaultHeaders = {
        'User-Agent': 'node/http-request-lib/v0.1',
        'Accept': '*/*'
    };

    /**
     * Key-value pairs of cookie
     * @type {}
     */
    Request.prototype.cookiesObj = {};

    /**
     *
     * @param cookies
     * @returns {*}
     */
    Request.prototype.cookies = function(cookies) {
        if (!cookies) {
            return this.cookiesObj;
        }

        this.cookiesObj = cookies;
        return this;
    };

    /**
     * Returns Cookie string for the request header
     * @returns {*}
     */
    Request.prototype.getCookiesHeader = function() {
        var i,
            cookie = '',
            cookies = this.cookies();

        if (_.isEmpty(cookies)) {
            return null;
        }

        for (i in cookies) {
            if (cookies.hasOwnProperty(i)) {
                cookie += i + '=' + cookies[i] + '; ';
            }
        }

        return cookie;
    };

    /**
     * Return object of URL parsed object
     * @returns {object}
     */
    Request.prototype.getUrlParts = function() {
        if (!this.urlParts) {
            this.urlParts = url.parse(this.url);
        }

        if (this.urlParts.host === null) {
            throw new Error('Url is invalid');
        }

        return this.urlParts;
    };

    /**
     * Returns the current request protocol
     * @returns {string}
     */
    Request.prototype.getProtocol = function() {
        return this.getUrlParts().protocol;
    };

    /**
     * Returns the current request host
     * @returns {string}
     */
    Request.prototype.getHost = function() {
        return this.getUrlParts().host;
    };

    /**
     * Returns the current request URI with query string
     * @returns {string}
     */
    Request.prototype.getUri = function() {
        var parts = this.getUrlParts(),
            queryObject = queryString.parse(parts.query),
            query = '';

        if (this.method === 'GET') {
            queryObject = _.extend(queryObject, this.body);
        }

        if (!_.isEmpty(queryObject)) {
            query = '?' + queryString.encode(queryObject);
        }

        return parts.pathname + query;
    };

    /**
     * Returns the current request port
     * @returns {number}
     */
    Request.prototype.getPort = function() {
        var protocol = this.getProtocol(),
            port = this.getUrlParts().port ;

        if (protocol === 'https:' && !port) {
            return 443;
        }

        if (protocol === 'http:' && !port) {
            return 80;
        }

        return this.getUrlParts().port;
    };

    /**
     * Returns the current request body
     * @returns {string}
     */
    Request.prototype.getBody = function() {
        if (this.method === 'GET' || this.method === 'HEAD') {
            return '';
        }

        if (this.dataType === 'json') {
            return this.getJsonBody();
        }

        if (this.dataType === 'form-url-encoded') {
            return this.getUrlEncodedBody();
        }

        return this.body;
    };

    /**
     * Returns the body encoded to JSON
     * @returns {string}
     */
    Request.prototype.getJsonBody = function() {
        return JSON.stringify(this.body);
    };

    /**
     * Returns the body encoded as query string
     * @returns {string}
     */
    Request.prototype.getUrlEncodedBody = function() {
        return queryString.encode(this.body);
    };

    /**
     * Returns the current Request header Object
     * @returns {object}
     */
    Request.prototype.getHeaders = function() {
        var requestedHeaders = this.headers,
            headers = _.clone(this.defaultHeaders),
            generatedHeaders = this.headerTransformers,
            i,
            headerVal;

        for (i in generatedHeaders) {
            if (generatedHeaders.hasOwnProperty(i)) {
                headerVal = this[generatedHeaders[i]]();

                if (headerVal) {
                    headers[i] = headerVal;
                }
            }
        }

        _.extend(headers, requestedHeaders);

        return headers;
    };

    /**
     * Returns the request body content length
     * @returns {number}
     */
    Request.prototype.getContentLength = function() {
        return this.getBody().length;
    };

    /**
     * Returns the current request content type
     * @returns {string}
     */
    Request.prototype.getContentType = function() {
        if (!_.has(this.supportedDataTypes, this.dataType)) {
            return '';
        }

        return this.supportedDataTypes[this.dataType];
    };

    /**
     * Return Authorization header value
     * @returns {string|null}
     */
    Request.prototype.getAuthorization = function() {
        var auth = this.auth;

        if (!auth.username || !auth.password) {
            return null;
        }

        return 'Basic ' + new Buffer(auth.username + ':' + auth.password).toString('base64');
    };

    module.exports = Request;
}(global));
