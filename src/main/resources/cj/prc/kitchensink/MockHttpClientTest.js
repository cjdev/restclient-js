/*jshint newcap: false*/
/*global $, module, test, equal, ok, expect, fail, MockHttpClient */

module("MockHttpClientTest", {
    setup: function () {
        // GIVEN
        this.routeOne = {
            request: {
                url: "/my/resource/path",
                method: "GET",
                headers: {
                    Accept: "text/plain"
                }
            },
            response: {
                status: 200,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: "this is a body"
            }
        };

        this.routeTwo = {
            request: {
                url: "/my/other/resource/path",
                method: "PUT",
                headers: {
                    Accept: "text/plain"
                }
            },
            response: {
                status: 200,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: "this is another body"
            }
        };

        this.httpClient = MockHttpClient([this.routeOne, this.routeTwo]);
    },
    teardown: function () {
        delete this.routeOne;
        delete this.http;
    }
});

test("mock client can mock out http responses", function () {
    var actualResponse,
        expectedResponse = this.routeOne.response;

	// WHEN
	this.httpClient({
		url: this.routeOne.request.url,
		method: this.routeOne.request.method,
        headers: this.routeOne.request.headers,
		onResponse: function (response) {
            actualResponse = response;
        }
	});

    // THEN
    equal(actualResponse.body, expectedResponse.body, "The response body is mocked as expected.");
    equal(actualResponse.status, expectedResponse.status, "The response status is mocked as expected.");
    equal(actualResponse.headers["Content-Type"], "text/plain");
});

test("Error is thrown when an unexpected call is made", function () {
    var raisedError,
        expectedError = "Invalid Request:  URL|" + this.routeOne.request.url + '|Method|GET|Headers|{"someHeader":"yup"}|Data|"some data here"';

    // WHEN
    try {
        this.httpClient({
            url: this.routeOne.request.url,
            method: "GET",
            data: "some data here",
            headers: {
                "someHeader": "yup"
            },
            onResponse: function (response) {
                raisedError = undefined;
            }
        });
    } catch (e) {
        raisedError = e.message;
    }

    // THEN
    equal(raisedError, expectedError, "A route not defined raises an explicit error message.");
});

test("Url and method are required request properties", function () {
    var errorThrown,
        expectedError = "Mock object requests must contain the following properties: url, method";

    try {
        MockHttpClient([{
            request: {},
            response: { status: 200 }
        }]);
    } catch (e) {
        errorThrown = e.message;
    }

    equal(errorThrown, expectedError);
});

test("Response must contain a status, and optionally headers", function () {
    var errorThrown,
        expectedError = "Mock object responses must contain the following property: status";

    try {
        MockHttpClient([{
            request: { url: "/index.html", method: "GET" },
            response: {}
        }]);
    } catch (e) {
        errorThrown = e.message;
    }

    equal(errorThrown, expectedError);
});
