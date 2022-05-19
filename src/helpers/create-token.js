const jwt = require('jsonwebtoken')

module.exports = {
    //buat middleware
    createToken: (payload) => {
        return jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: '1h'
        })
    }
}