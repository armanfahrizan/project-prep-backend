const fs = require('fs')
const path = require('path')
const database = require('../config').promise()
const createError = require('../helpers/create-error')
const createRespond = require('../helpers/create-respond')
const {http_status_code, http_status_message} = require('../helpers/http-status')
const dir_pict = './public/profiles/'
const dir_ava = './public/avatars'
const dir_photo = './public/photos'

//post Profile Picture
module.exports.addProfilePicture = async (req, resp) => {
    const userId = req.params.userId
    console.log(`userId:`,userId);
    const pict = req.file
    console.log(`req.file:`, req.file);
    try {
        //1. check type file
        if(!pict){
            throw new createError(http_status_code.BAD_REQUEST, 'File not found.')
        }

        //2. Check data user
        const CHECK_PROFILE = `SELECT * FROM users WHERE userId = ?;`
        const [PROFILE] = await database.execute(CHECK_PROFILE, [userId])
        if(!PROFILE.length){
            throw new createError(http_status_code.BAD_REQUEST, `Please edit your profile first.`)
        }

        //2.2 create base url name
        const urlNameImage = `${req.protocol}://${req.get("host")}/profiles/${req.file.filename}`
        console.log(`urlFIleName:`, urlNameImage);

        //3. save file to our database
        const ADD_PROFILE_PICTURE = `UPDATE users SET profilepicture = ? WHERE userId = ?;`
        console.log(`edit profile picture:`, pict.filename);
        const [INFO] = await database.execute(ADD_PROFILE_PICTURE, [urlNameImage, userId])
        console.log(`INFO:`, INFO);

        //3. send respond
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'post profile picture', 1, 1, 'Profile picture has been uploaded. ')
        resp.status(respond.status).send(respond.data)
    } catch (err) {
        console.log(`error:`, err);

        //delete image form multer if error
        fs.unlinkSync(path.join(dir_pict + pict.filename)) 

        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

module.exports.addAvatar = async (req, resp) => {
    const userId = req.params.userId
    console.log(`userId:`,userId);
    const ava = req.file
    console.log(`req.file:`, req.file);
    try {
        //1. check type file
        if(!ava){
            throw new createError(http_status_code.BAD_REQUEST, 'File not found.')
        }

        //2. Check data user
        const CHECK_PROFILE = `SELECT * FROM users WHERE userId = ?;`
        const [PROFILE] = await database.execute(CHECK_PROFILE, [userId])
        if(!PROFILE.length){
            throw new createError(http_status_code.BAD_REQUEST, `Please edit your profile first.`)
        }

        //2.2 create base url name
        const urlNameImage = `${req.protocol}://${req.get("host")}/avatars/${req.file.filename}`
        console.log(`urlFIleNameAvatar:`, urlNameImage);

        //3. save file to our database
        const ADD_PROFILE_PICTURE = `UPDATE users SET avatar = ? WHERE userId = ?;`
        console.log(`edit profile picture:`, ava.filename);
        const [INFO] = await database.execute(ADD_PROFILE_PICTURE, [urlNameImage, userId])
        console.log(`INFO:`, INFO);

        //3. send respond
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'Change Avatar Image', 1, 1, 'Avatar has been changed. ')
        resp.status(respond.status).send(respond.data)
    } catch (err) {
        console.log(`error:`, err);

        //delete image form multer if error
        fs.unlinkSync(path.join(dir_ava + ava.filename)) 

        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

module.exports.addPhoto = async (req, resp) => {
    const userId = req.params.userId
    console.log(`userId:`,userId);
    const image = req.file
    console.log(`req.file:`, image);
    try {
        //1. check type file
        if(!image){
            throw new createError(http_status_code.BAD_REQUEST, 'File not found.')
        }

        //2.2 create base url name
        const urlNameImage = `${req.protocol}://${req.get("host")}/photos/${req.file.filename}`
        console.log(`urlFIleNamePhoto:`, urlNameImage);

        //2. save image to uor database
        const ADD_POST_IMAGE = `INSERT INTO photos (userId, image) VALUES (${database.escape(userId)}, ${database.escape(urlNameImage)});`
        console.log(`post image:`, image.filename);
        const [INFO] = await database.execute(ADD_POST_IMAGE)
        console.log(`INFO:`, INFO);

        //3. send respond
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'posting photo', 1, 1, 'Image has been uploaded. ')
        resp.status(respond.status).send(respond.data)
        
    } catch (err) {
        console.log(`error:`, err);

        //delete image if error
       fs.unlinkSync(path.join(dir_photo + image.filename)) 

        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}