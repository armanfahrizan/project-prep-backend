//import router
const routers = require('express').Router()

//import controller
const {post} = require('../controllers')

//define routes
routers.get('/post/:userId', post.getAllPostByUserId)
routers.post('/post/:userId', post.addNewPost)
routers.put('/post/:id', post.editCurrentPost)
routers.delete('/post/:id', post.deletePost)

//export * modules
module.exports = routers
