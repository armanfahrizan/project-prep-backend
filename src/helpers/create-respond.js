const {http_status_code, http_status_message} = require('./http-status')

class createRespond {
    constructor(
        status = http_status_code.OK,
        message = http_status_message.OK,
        operation,
        get_data,
        total_data,
        data = []
    )
    {
        this.status = status,
        this.message = message,
        this.operation = operation,
        this.get_data = get_data,
        this.total_data = total_data,
        this.data = data
    }
}

module.exports = createRespond