Requestify - Simplifies node HTTP request making. [![Build Status](https://secure.travis-ci.org/ranm8/requestify.png?branch=master)](http://travis-ci.org/ranm8/requestify)
==============================================

Requestify is a super easy to use and extendable HTTP client for nodeJS + it supports cache (-:.

## Installation

	npm install requestify  

## How to use?

Requestify is extremely easy to use and always return a promise (using the amazing Q module)...

Simply require the module and start requesting:

``` javascript
var requestify = require('requestify'); 
```
GET Request:

``` javascript
requestify.get('http://example.com').then(function(response) {
	// Get the response body
	response.getBody();
});
```

POST Request in JSON:

``` javascript
requestify.post('http://example.com', {
		hello: 'world'
	})
	.then(function(response) {
		// Get the response body
		response.getBody();
	});
```

## Configuration methods

### requestify.setEncoding(encoding)

Sets Requestify's encoding. Requestify will use this encoding to decode the responses.
Defaults to utf8.

```javascript
requestify.setEncoding('utf8'); // utf8 is set by default anyway.
```

### requestify.redis(redisInstance)

Sets Redis client instance. Requestify will use that instance for caching responses.
Please note, Requestify will NOT cache anything by default and caching is allowed only for GET requests (see @cache options for further info).

```javascript
var redis = require('redis');

requestify.redis(redis.createClient());
```

## API Reference

### options

#### `method {string}` 
HTTP method to use, can be any valid HTTP method (e.g. POST, GET, DELETE, HEAD, PUT, etc.).

#### `body {object|string}`
Can be either an object (key, val) or a string, will be formatted depending on the dataType property and served via response body.

#### `headers {object}` 
(key, value) object of headers (some headers like content-length are set by default)

#### `cookies {object}` 
(key, value) object of cookies to encode and serve via the request header.

#### `auth {{ username: string, password: string }} `
Adds Basic authentication header with given username and password

#### `dataType {string}` 
Determines the request data type (json|form-url-encoded), this option will encode the request body according to the given dataType and will add the appropriate header (defaults to json). 

If null will be given, the body will be served as string.

#### `timeout {number} `
Set a timeout (in milliseconds) for the request.

#### `cache {{ cache: boolean, expires: number }}`
Requistify has built-in Redis based caching mechanism. For using this feature, set the cache property to true using the following object:

```javascript
{
	cache: true, // Will set caching to true for this request.
	expires: 3600 // Time for cache to expire in seconds
}
```

Caching will always be set to `false` by default.


### requestify.request(url, options)

Executes a custom request according to options object

``` javascript
requestify.request('https://example.com/api/foo', {
	method: 'POST',
	body: {
		foo: 'bar'
		bar: 'foo'
	},
	headers: {
		'X-Forwarded-By': 'me'
	},
	cookies: {
		mySession: 'some cookie value'
	},
	auth: {
		username: 'foo',
		password: 'bar'
	},
	dataType: 'json'		
})
.then(function(response) {
	// get the response body
	response.getBody();

   	// get the response headers
 	response.getHeaders();

 	// get specific response header
 	response.getHeader('Accept');
 
 	// get the code
 	response.getCode();
});
```
### requestify.get(url, options)

Executes a GET method request
``` javascript
requestify.get('http://example.com').then(function(response) {
	// Get the response body
	response.getBody();
});
```
### requestify.post(url, data, options)

Executes a POST method request
``` javascript
requestify.post('http://example.com', {
		hello: 'world'
})
.then(function(response) {
	// Get the response body
	response.getBody();
});
```

### requestify.put(url, data, options)

Executes a PUT method request

``` javascript
requestify.put('http://example.com', 'some-file-content').then(function(response) {
	// Get the response body
	response.getBody();
});
```

### requestify.delete(url, options)

Executes a DELETE method request

``` javascript
requestify.delete('http://example.com').then(function(response) {
	// Get the response body
	response.getBody();
});
```

### requestify.head(url, options)

Executes a HEAD method request

``` javascript
requestify.head('http://example.com').then(function(response) {
	// Get the response code
	response.getCode();
});
```

## Running Tests

To run the test suite first install the development dependencies:

	$ npm install	

Then run the tests:

	$ npm test

## License

The MIT License (MIT)

Copyright (c) 2013 Ran Mizrahi <<ranm@codeoasis.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

