//import router
const routers = require('express').Router()

//import controller
const {post} = require('../controllers')

//import middleware multer
const {postPict} = require('../helpers/multer-config')

//define routes
routers.get('/all/caption/', post.getPosts)
routers.get('/caption/:userId', post.getAllPostByUserId)
routers.post('/caption/:userId', postPict.single('image'), post.addNewPost)
routers.put('/caption/:id', post.editCurrentPost)
routers.delete('/caption/:id', post.deletePost)

//export * modules
module.exports = routers
