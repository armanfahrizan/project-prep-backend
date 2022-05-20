//import router
const routers = require('express').Router()

//import middleware multer
const {postPict, profilePict, avaPict} = require('../helpers/multer-config')

//import controller
const {uploader} = require('../controllers')


// define routes
routers.post('/photo/:userId', postPict.single('image'), uploader.addPhoto)
routers.patch('/upload/:userId', profilePict.single('image'), uploader.addProfilePicture)
routers.patch('/ava/:userId', avaPict.single('image'), uploader.addAvatar)

//export * router
module.exports = routers