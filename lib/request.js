'use strict';

var url = require('url'),
    queryString = require('querystring'),
    _ = require('underscore');

/**
 * Constructor for the Request object
 * @param {string} url - Full endpoint URL (e.g. [protocol]://[host]/[uri]
 * @param {{ method: string, body: string|object, params: object, headers: object, dataType: string, auth: object, timeout: number, cookies: object }} options
 * @constructor
 */
function Request(url, options) {
    if (!url) {
        throw new Error('URL must in mandatory to initialize Request object');
    }

    if (!options.method) {
        throw new Error('Cannot execute HTTP request without specifying method');
    }

    this.url = url;
    this.method = options.method;
    this.body = options.body || {};
    this.params = options.params || {};
    this.path = options.path || null;
    this.headers = options.headers || {};
    this.dataType = (options.dataType === undefined) ? 'json' : options.dataType;
    this.auth = options.auth || {};
    this.cache = options.cache || { cache: false, expires: 3600 };
    this.timeout = options.timeout || 30000;
    this.cookies(options.cookies);
    this.redirect = options.redirect || false
}

/**
 * Returns full URL
 * @returns {string}
 */
Request.prototype.getFullUrl = function() {
    return this.getProtocol() + '//' + this.getHost() + this.getUri();
};

/**
 * Object contains the special header generators, it's an object with header name and handling function within this object (e.g. Content-Length, Authorization, etc.)
 * @type {{ headerName: string }}
 */
Request.prototype.headerTransformers = {
    'Content-Type': 'getContentType',
    'Cookie': 'getCookiesHeader',
    'Content-Length': 'getContentLength'
};

/**
 * Returns the request path option
 * @returns {string|null}
 */
Request.prototype.getPath = function() {
    return this.path;
};

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
 *
 * @param cookies
 * @returns {object|Request}
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
 * @returns {null|string}
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
    this.urlParts = url.parse(this.url);

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
    return this.getUrlParts().hostname;
};
/**
 * Returns the current redirect flag
 * @returns {boolean}
 */
Request.prototype.getRedirect = function() {
    return this.redirect;
};
/**
 * Returns the current request URI with query string
 * @returns {string}
 */
Request.prototype.getUri = function() {
    var parts = this.getUrlParts(),
        queryObject = _.extend(queryString.parse(parts.query), this.params),
        query = '';

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
    return Buffer.byteLength(this.getBody().toString());
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
 * Return : separated user password
 * @returns {string|null}
 */
Request.prototype.getAuthorization = function() {
    var auth = this.auth;

    // Allow an empty or undefined password if the username is defined
    // Return null only if both the username and password are empty
    if (!auth.username && typeof auth.password === 'undefined') {
        return null;
    }

    return auth.username + ':' + auth.password;
};

module.exports = Request;
