module.exports.http_status_code = {
    OK: 200,
    CREATED: 201,
    ACCEPT: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    INTERNAL_SERVICE_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
}

module.exports.http_status_message = {
    OK: "Success",
    CREATED: "Your Request is Created",
    ACCEPT: "Your Request is Accepted",
    BAD_REQUEST: "Your Syntax is Invalid",
    UNAUTHORIZED: "You need Authentication",
    FORBIDDEN: "You don't have Access to open this page",
    NOT_FOUND: "URL Not Found",
    REQUEST_TIMEOUT: "Your Connection is Timeout",
    INTERNAL_SERVICE_ERROR: "Internal Server is Error",
    SERVICE_UNAVAILABLE: "Server in Maintenance"
}