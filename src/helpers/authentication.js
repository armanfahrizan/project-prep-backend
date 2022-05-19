const jwt = require('jsonwebtoken')
const {http_status_code, http_status_message} = require('./http-status')
const createError = require('./create-error')

module.exports = (req, resp, next) => {
    const token = req.header('authToken')
    try {
        //1. check token
        if(!token){
            throw new createError(http_status_code.UNAUTHORIZED, http_status_message.UNAUTHORIZED)
        }

        //2. verify token
        const {userId} = jwt.verify(token, process.env.SECRET_KEY)
        console.log(`userId when keep login:`, userId);
        //3. modified object request
        req.userId = userId
        next()
    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}
