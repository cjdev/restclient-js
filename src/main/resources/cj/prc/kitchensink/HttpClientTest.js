/*jshint newcap: false*/
/*global module, test, equal, ok, HttpClient */

module("HttpClientTest");

test("happy path", function () {
    var actualResponse,
        expectedResponse = {
            body: "Some Body",
            status: 200,
            headers: { "Content-Type": "text/html; charset=UTF-8" }
        },
        mockAjax = function (options) {
            equal(options.type, "GET");
            equal(options.url, "http://www.cj.com");
            equal(options.processData, false);
            equal(options.dataType, "text");
            equal(options.headers.someHeader, "yup");
            equal(options.async, false);

            equal(typeof options.success, "function");
            equal(typeof options.error, "function");

            options.success({}, 200, {
                status: expectedResponse.status,
                responseText: expectedResponse.body,
                getAllResponseHeaders: function () {
                    return "Date: Mon, 09 Jul 2012 18:13:11 GMT\nContent-Length: 3531\nServer: Resin/3.1.8\nContent-Type: text/html; charset=UTF-8";
                }
            });
        };

    // WHEN
    HttpClient({
            url: "http://www.cj.com",
            method: "GET",
            headers: {
                "someHeader": "yup"
            },
            onResponse: function (response) {
                actualResponse = response;
            }
        }, {
            async: false,
            ajax: mockAjax
        });


    // THEN
    equal(actualResponse.body, expectedResponse.body);
    equal(actualResponse.status, expectedResponse.status);
    equal(actualResponse.headers["Content-Type"], expectedResponse.headers["Content-Type"]);
});
