const {http_status_code, http_status_message} = require('./http-status')

class createError {
    constructor (httpStatusCode = http_status_code.INTERNAL_SERVICE_ERROR, message = http_status_message.INTERNAL_SERVICE_ERROR) {
        this.status = httpStatusCode
        this.message = message
    }
}

module.exports = createError