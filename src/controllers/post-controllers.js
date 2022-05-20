const database = require('../config').promise()
const createError = require('../helpers/create-error')
const createRespond = require('../helpers/create-respond')
const {http_status_code, http_status_message} = require('../helpers/http-status')

//get all post
module.exports.getPosts = async (req, resp) => {
    try {
        //do query
        const ALL_POSTS = `SELECT * FROM photos;`
        const [POSTS] = await database.execute(ALL_POSTS)
        if (!POSTS.length){
            throw new createError(http_status_code.BAD_REQUEST, http_status_message.BAD_REQUEST)
        }

        //send respond
        const respond = new createRespond(http_status_code.OK, http_status_message.OK, 'get all posts', POSTS.length, POSTS.length, POSTS)
        resp.status(respond.status).send(respond)
    } catch (err) {
        const throwError = error instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//get post by Id
module.exports.getAllPostByUserId = async (req, resp) => {
    const userId = req.params.userId
    try {
        //1. do query and execute
        const GET_POSTS = `SELECT * FROM photos WHERE userId = ?`
        const [POSTS] = await database.execute(GET_POSTS, [userId])
        console.log(`All Post:`, POSTS);
        // if(!POSTS.length){
        //     throw new createError(http_status_code.NOT_FOUND, "You don't have any post")
        // }

        //2. send respond to client
        const respond = new createRespond(http_status_code.OK, http_status_message.OK, 'Get All Users', POSTS.length, POSTS.length, POSTS)
        resp.status(respond.status).send(respond)
    }catch (err) {
        const throwError = error instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//add new post
module.exports.addNewPost = async(req, resp) => {
    const userId = req.params.userId
    const {caption, location, friend} = req.body
    const image = req.file
    try {
        console.log(`file:`, req.file);
        console.log(`body:`, req.body);
        //1. check image
        if(!image){
            throw new createError(http_status_code.BAD_REQUEST, 'File not found.')
        }

        //3. create baseURL name ofr image
        const urlNameImage = `${req.protocol}://${req.get("host")}/photos/${req.file.filename}`
        console.log(`urlFIleNamePhoto:`, urlNameImage);

        //4. do query to post
        const ADD_NEW_POST = `INSERT INTO photos (userId, image, caption, location, friend) VALUES (?, ?, ?, ?, ?);` 
        const [POST] = await database.execute(ADD_NEW_POST, [userId, urlNameImage, caption, location, friend])
        console.log(`POST:`, POST);
        
        //3. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'add new post', 1, 1, 'Your post is success')
        resp.status(respond.status).send(respond.data)
    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//edit post
module.exports.editCurrentPost = async (req, resp) => {
    const body = req.body
    const id = req.params.id
    try {
        //1. do query and execute
        const EDIT_POST = `UPDATE photos SET caption = ${database.escape(body.caption)}, location = ${database.escape(body.location)}, with = ${database.escape(body.with)} 
        WHERE id = ${database.escape(id)};`
        const [POST] = await database.execute(EDIT_POST)
        console.log(`POST:`, POST);
        
        //2. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'add new post', 1, 1, 'Your post has updated.')
        resp.status(respond.status).send(respond.data)

    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//delete post
module.exports.deletePost = async (req, resp) => {
    const id = req.params.id
    try {
        //1. do query and execute
        const DELETE_POST = `DELETE FROM photos WHERE id = ${database.escape(id)}`
        const [POST] = await database.execute(DELETE_POST)
        console.log(`POST:`, POST);
        
        //2. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'add new post', 1, 1, 'Your post is deleted')
        resp.status(respond.status).send(respond.data)

    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}