/*jshint newcap: false*/
/*global console */

function MockHttpClient(mockHttpPatterns) {
    function headersMatch(candidate, actual) {
        var prop;

        if (typeof candidate !== typeof actual) {
            return false;
        }

        for (prop in candidate) {
            if (candidate.hasOwnProperty(prop)) {
                if (candidate[prop] !== actual[prop]) {
                    // console.log("UNMATCHED HEADER " + prop + "|" + actual[prop] + "|" + candidate[prop] + "|");
                    return false;
                }
            }
        }

        for (prop in actual) {
            if (actual.hasOwnProperty(prop)) {
                if (candidate[prop] !== actual[prop]) {
                    // console.log("UNMATCHED *HEADER " + prop + "|" + actual[prop] + "|" + candidate[prop] + "|");
                    return false;
                }
            }
        }

        return true;
    }

    function routeFor(request) {
        var matchedRoute, i, prop, requestCandidate, match,
            len = mockHttpPatterns.length;

        // console.log("request: " + JSON.stringify(request));

        for (i = 0; i < len; i += 1) {
            match = true;
            requestCandidate = mockHttpPatterns[i].request;

            // console.log("trying: " + JSON.stringify(requestCandidate));

            for (prop in requestCandidate) {
                if (prop !== "header" && prop !== "headers" && requestCandidate.hasOwnProperty(prop)) {
                    if (requestCandidate[prop] !== request[prop]) {
                        // console.log("****** DID NOT MATCH " + prop + ":|" + request[prop] + "|" + requestCandidate[prop] + "|");
                        match = false;
                        break;
                    }
                }
            }

            if (match && headersMatch(requestCandidate.headers, request.headers)) {
                matchedRoute = mockHttpPatterns[i];
            }
        }

        return matchedRoute;
    }

    function mockClient(request) {
        var match = routeFor(request);

        if (match) {
            if (typeof match.response === "function") {
                request.onResponse(match.response(request));
            } else {
                request.onResponse(match.response);
            }
        } else {
            throw new Error("Invalid Request:  URL|" + request.url + "|Method|" + request.method + "|Headers|" + JSON.stringify(request.headers) + "|Data|" + JSON.stringify(request.data));
        }
    }

    function validateRoutes() {
        var i, route;

        for (i = 0; i < mockHttpPatterns.length; i++) {
            route = mockHttpPatterns[i];

            // backwards compatibility for rest-specs
            if (typeof route.request === "undefined") {
                throw new Error("Mock object needs a request!");
            }
            route.request.url = route.request.url || route.url;
            route.request.headers = route.request.headers || route.request.header;
            route.request.data = route.request.data || (route.request.representation ? route.request.representation.asText : undefined);
            delete route.request.representation;
            delete route.request["representation-ref"];

            route.response.headers = route.response.headers || route.response.header;
            route.response.status = route.response.status || route.response.statusCode;
            route.response.body = route.response.body || (route.response.representation ? route.response.representation.asText : undefined);

            if (typeof route.request.url === "undefined" || typeof route.request.method === "undefined") {
                throw new Error("Mock object requests must contain the following properties: url, method");
            }

            if (typeof route.response === "undefined") {
                throw new Error("Mock objects must contain a response");
            }

            if (typeof route.response !== "function" && typeof route.response.status === "undefined") {
                throw new Error("Mock object responses must contain the following property: status");
            }
        }
    }
    
    validateRoutes();

	return mockClient;
}
