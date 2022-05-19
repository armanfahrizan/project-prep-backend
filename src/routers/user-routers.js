//import router
const routers = require('express').Router()

//import controller
const {user} = require('../controllers')

//import middleware
const auth = require('../helpers/authentication')

//define routes
routers.post('/user/register', user.registerUser)
routers.get('/auth/verify/:token', user.verifyUser)
routers.post('/user', user.loginUser)
routers.get('/keep/login', auth, user.keepLogin)
routers.post('/resend/:token', user.refreshToken)
routers.post('/reset', user.resetPassword)
routers.patch('/reset/verify/:userId', user.verifyResetPassword)
routers.patch(`/edit/profile/:userId`, user.editProfile)

//export modules
module.exports = routers