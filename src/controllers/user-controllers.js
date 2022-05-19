const database = require('../config').promise()
const uid = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const createError = require('../helpers/create-error')
const createRespond = require('../helpers/create-respond')
const {http_status_code, http_status_message} = require('../helpers/http-status')
const {registerUserSchema, loginUserSchema, passwordSchema, resetPasswordSchema, editUserSchema} = require('../helpers/validation-schema')


//REGISTER USER
module.exports.registerUser = async (req, resp) => {
    const {fullname, username, email, password} = req.body
    try{
        //1. validate body use joiSchema
        const validateUserSchema = registerUserSchema.validate(req.body)
        console.log(`registerSchema:`, validateUserSchema);
        if(validateUserSchema.error){
            throw new createError(http_status_code.BAD_REQUEST, validateUserSchema.error.details[0].message)
        }
        
        const validatePassword = passwordSchema.validate(password, {details: true})
        console.log(`validatePassword:`, validatePassword );
        console.log(`validatePassword.length:`, validatePassword.length );
        if(validatePassword.length){
            throw new createError(http_status_code.BAD_REQUEST, validatePassword[0].message)
        }

        //2.3 check if verify yet
        const CHECK_USER = `SELECT * FROM users WHERE username = ? AND email = ?;`
        const [USER] = await database.execute(CHECK_USER, [username, email])
        console.log(`CHECK USER IF NOT VERIFY:`, USER);
        if(USER.length){
            throw new createError(http_status_code.BAD_REQUEST, "Your account has been registered.")
        }

        //2.1 check duplicate username
        const CHECK_USERNAME = ` SELECT username FROM users WHERE username = ?;`
        const [USERNAME] = await database.execute(CHECK_USERNAME, [username])
        console.log(`check duplicate username:`, USERNAME);
        if(USERNAME.length){
            throw new createError(http_status_code.BAD_REQUEST, 'Username has been already exist. Please use another username')
        }

        //2.2 check duplicate email
        const CHECK_EMAIL = ` SELECT email FROM users WHERE email = ?;`
        const [EMAIL] = await database.execute(CHECK_EMAIL, [email])
        console.log(`check duplicate email:`, EMAIL);
        if(EMAIL.length){
            throw new createError(http_status_code.BAD_REQUEST, 'Email has been already exist. Please use another email')
        }

        //3. add userId from uid
        const userId = uid.v4().toUpperCase()
        req.body.userId = userId
        console.log(`userId:`, userId);

        //4. encoding password
        const hashpassword = await bcrypt.hash(password, 10)
        console.log(`password:`, hashpassword);

        //6. do and execute query
        const POST_USER = `INSERT INTO users (userId, fullname, username, email, password) VALUES (?, ?, ?, ?, ?);`
        await database.execute(POST_USER, [userId, fullname, username, email, hashpassword])
        
        //7. create jwt token
        const token = await jwt.sign({username}, process.env.SECRET_KEY, {expiresIn: '1h'})
        console.log(`jwt token:`, token);

        //8. do query and execute to database tokens
        const ADD_TOKEN = `INSERT INTO tokens (userId, token) VALUES (?, ?);`
        const [INFO] = await database.execute(ADD_TOKEN, [userId, token])
        console.log(`info add token:`, INFO);

        //9. send email to user
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : 'fahrizanariz0811@gmail.com',
                pass : process.env.EMAIL_PASS
            },
            tls : { rejectUnauthorized : false}
        })
        // console.log(`transporter:`, transporter);
        await transporter.sendMail({
            from : '"Admin" <fahrizanariz0811@gmail.com>',
            to : `${email}`,
            subject : 'Account Verification',
            html : `
                <p>Please verify your account immediately, in <b>1 hour</b>, this link will be expire</p>
                <a href='http://localhost:3000/verify/${token}/verify/${userId}'>Click here for verification your account</a>
            `
        })
        
        //10. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'Add New User', 1, 1, `Registration success. Please check your email to verify your account.`)
        console.log(`RESPOND:`, respond);
        resp.status(respond.status).send(respond.data)
    }catch(err){
        console.log(`error:`, err);
        const throwError = err instanceof createError
        console.log(`error from throw error:`, throwError);
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//VERIFICATION USER
module.exports.verifyUser = async (req, resp) => {
    const token = req.params.token
    console.log(`token at verify:`, token);
    const userId = req.header('UID')
    console.log(`userID at verify:`, userId);
    try {
        //1. check token if empty
        if(!token){
            throw new createError(http_status_code.BAD_REQUEST, 'You need register first')
        }

        //2. if token not empty, check in database
        const CHECK_TOKEN = `select * FROM tokens WHERE userId = ? AND token = ?;`
        const [TOKEN] = await database.execute(CHECK_TOKEN, [userId, token])
        console.log(`TOKEN at verify:`, TOKEN);
        if(!TOKEN.length){
            throw new createError(http_status_code.BAD_REQUEST, 'Check your email, and click link verification')
        }

        //3. if token expired
        const now = new Date().getTime()
        console.log(`getTime NOW:`, now);
        const created = new Date(TOKEN[0].createdAt).getTime()
        console.log(`getTime created:`, created);
        const remain = now - created
        console.log(`remain:`, remain);
        if(remain >= 3600000){
            throw new createError(http_status_code.REQUEST_TIMEOUT, 'Your link verification has expired')
        }

        //4. if token valid and doesn't expire
        const CHANGE_STATUS = `UPDATE users SET status = 1 WHERE userId = ?;`
        await database.execute(CHANGE_STATUS, [userId])

        //5. DELETE token if success
        const DELETE_TOKEN = `DELETE FROM tokens WHERE userId = ? AND token = ?;`
        await database.execute(DELETE_TOKEN, [userId, token])

        //6. send respond
        const respond = new createRespond(http_status_code.OK, http_status_message.OK, 'Post New User', 1, 1, 'Your Account has verified')
        console.log(`respond to client:`, respond);
        resp.status(respond.status).send(respond)
        console.log(`respond.data to client:`, respond.data);

    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//LOGIN USER
module.exports.loginUser = async (req, resp) => {
    const {username, password} = req.body
    try { 
        //1. validate body from schema
        const validateUsername = loginUserSchema.validate(req.body)
        console.log(`validateBody:`, validateUsername)
        if(validateUsername.error){
            throw new createError(http_status_code.BAD_REQUEST, validateUsername.error.details[0].message)
        }

        const validatePassword = passwordSchema.validate(password, {details: true})
        console.log(`validatePassword:`, validatePassword );
        if(validatePassword.length){
            throw new createError(http_status_code.BAD_REQUEST, validatePassword[0].message)
        }

        //2. Check data user in database
        const GET_USERNAME = `SELECT * FROM users WHERE username = ${database.escape(username)} OR email = ${database.escape(username)};`
        const [USERNAME] = await database.execute(GET_USERNAME)
        console.log(`USER:`, USERNAME);
        //if doesnt exist
        if(!USERNAME.length){
            throw new createError(http_status_code.NOT_FOUND, `Username ${username} doesn't found`)
        }

        //3. if user exist in our database -> validate password ->  do authentication
        // -> check password -> req.body.password vs password from our database
        const valid = await bcrypt.compare(password, USERNAME[0].password)
        console.log(`result:`, valid);
        //if doesnt exist
        if(!valid){
            throw new createError(http_status_code.NOT_FOUND, `Password doesn't match`)
        }

        //4. Check status user, verify?
        if(USERNAME[0].status === 0){
            console.log(`BELUM VERIFIKASI`);
            throw new createError(http_status_code.UNAUTHORIZED, 'You have to verify your account first. Check your email.')
        } 

        //5. create jwt token
        const token = await jwt.sign({userId : USERNAME[0].userId}, process.env.SECRET_KEY)
        console.log(`TOKENNYA when login:`, token); 

        //6. send respond
        const respond = new createRespond(http_status_code.OK, http_status_message.OK, 'Get User Data', 1, 1, USERNAME[0])
        console.log(`respon akhir:`, respond.data);
        resp.header('authToken', `Bearer ${token}`).send(respond)        
    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//Keep Login
module.exports.keepLogin = async (req, resp) => {
    // const token = req.header('authToken')
    //karena object request dimodified dg menambahkan uid oleh middleware, jadi pengecekan bisa menggunakan uid
    const userId = req.userId
    try {
        //after middleware auth procces, token has been validated by jwt
        //1. check user at database
        const CHECK_USER = `SELECT * FROM users WHERE userId = ?;`
        const [USER] = await database.execute(CHECK_USER, [userId])
        console.log(`user at keep login:`, USER);
        if(!USER.length){
            throw new createError(http_status_code.NOT_FOUND, `User not found`)
        }

        //2. create respond
        delete USER[0].password
        const respond = new createRespond(http_status_code.OK, http_status_message.OK, 'get keep login', 1, 1, USER[0])
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

//resend token
module.exports.refreshToken = async (req, resp) => {
    //define token
    const token = req.params.token
    try {
        //1. check data tokens to get userId
        const GET_USERID = `SELECT * FROM tokens WHERE token = ?;`
        const [USERID] = await database.execute(GET_USERID, [token])
        console.log(`userId at tokens:`, USERID);
        if(!USERID.length){
            throw new createError(http_status_code.NOT_FOUND, `userId with token ${token} not found`)
        }

        //1.1 Check username in database
        const GET_USER = `SELECT * FROM users WHERE userId = ?;`
        const [USER] = await database.execute(GET_USER, [USERID[0].userId])
        console.log(`user at refresh:`, USER);
        if(!USER.length){
            throw new createError(http_status_code.NOT_FOUND, `Account with username ${username} or email ${email} doesn't found.`)
        }
        const username = USER[0].username
        console.log(`username at USER[0]:`, USER[0].username);
        const email = USER[0].email

        //2. create jwt token
        const now = new Date()
        console.log(`now:`, now);
        const newToken = await jwt.sign({username}, process.env.SECRET_KEY, {expiresIn: '1h'})
        console.log(`jwt new token:`, newToken);

        //3. do query and execute to database tokens
        const UPDATE_TOKEN = `UPDATE tokens SET token = ${database.escape(newToken)}, createdAt = ${database.escape(now)} WHERE userId = ${database.escape(USER[0].userId)};`
        const [INFO] = await database.execute(UPDATE_TOKEN)
        console.log(`info add token:`, INFO);

        //8. send email to user
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : 'fahrizanariz0811@gmail.com',
                pass : process.env.EMAIL_PASS
            },
            tls : { rejectUnauthorized : false}
        })
        await transporter.sendMail({
            from : '"Admin" <fahrizanariz0811@gmail.com>',
            to : `${email}`,
            subject : 'Account Verification',
            html : `
                <p>Please verify your account using this link</p>
                <a href='http://localhost:3000/verify/${newToken}'>Click here for verification your account</a>

                <p>NOTE : this link can be acces in 1 hour</p>
            `
        })
        
        //9. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'Add New Token', 1, 1, `Resend Link Verification success, please verifiy your account immediately`)
        resp.header('UID', USER[0].userId).status(respond.status).send(respond.data)
    } catch (err) {
        console.log(`error:`, err);
        const throwError = err instanceof createError
        if(!throwError){
            err = new createError(http_status_code.INTERNAL_SERVICE_ERROR, http_status_message.INTERNAL_SERVICE_ERROR)
        }
        resp.status(err.status).send(err.message)
    }
}

//send link to reset Password
module.exports.resetPassword = async (req, resp) => {
    const {email} = req.body
    console.log(`email:`, email);
    try {
        //1. check email in database
        const CHECK_EMAIL = `SELECT * FROM users WHERE email = ?`
        const [EMAIL] = await database.execute(CHECK_EMAIL, [email])
        console.log(`DATA RESET PASSWORD:`, EMAIL);
        if(!EMAIL.length){
            throw new createError(http_status_code.NOT_FOUND, `Account with email ${email} doesn't found.`)
        }

        //2. define userId
        const userId = EMAIL[0].userId
        console.log(`userId at reset Pasword:`, userId);

        //3. send verification link to reset password
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : 'fahrizanariz0811@gmail.com',
                pass : process.env.EMAIL_PASS
            },
            tls : { rejectUnauthorized : false}
        })
        await transporter.sendMail({
            from : '"Admin" <fahrizanariz0811@gmail.com>',
            to : `${email}`,
            subject : 'Reset Password',
            html : `
                <p>You request to reset your password account.</p>
                <a href='http://localhost:3000/reset/${userId}/reset/${email}'>Click here to input your new password</a>
            `
        })

        //4. send respond to client
        const respond = new createRespond(http_status_code.OK, http_status_message.OK, 'send rest password link', 1, 1, "Check your email to reset tour password.")
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

//verify email for reset password
module.exports.verifyResetPassword = async (req, resp) => {
    const {email, password, repassword} = req.body
    console.log(`body:`, req.body);
    const userId = req.params.userId

    try {
        //1. validate body use joiSchema
        const validateResetPassword = resetPasswordSchema.validate(req.body)
        console.log(`registerSchema:`, validateResetPassword);
        if(validateResetPassword.error){
            throw new createError(http_status_code.BAD_REQUEST, validateResetPassword.error.details[0].message)
        }
        const validatePassword = passwordSchema.validate(password, {details: true})
        console.log(`validatePassword:`, validatePassword );
        if(validatePassword.length){
            throw new createError(http_status_code.BAD_REQUEST, validatePassword[0].message)
        }

        //2. check data user in database
        console.log(`userId:`, userId);
        const CHECK_USER = `SELECT * FROM users WHERE userId = ?;`
        const [USER] = await database.execute(CHECK_USER, [userId])
        console.log(`USER:`, USER);
        if(!USER.length){
            throw new createError(http_status_code.NOT_FOUND, `Account with userId ${userId} not found.`)
        }

        //3. hashing password
        const newHashPassword = await bcrypt.hash(password, 10)
        console.log(`password:`, newHashPassword);

        //4. do and execute query
        const UPDATE_PASSWORD = `UPDATE users SET password = ? WHERE userId = ? AND email = ?;`
        await database.execute(UPDATE_PASSWORD, [newHashPassword, userId, email])

        //5. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'Reset Password', 1, 1, `Reset Password Success`)
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

//Edit Profile
module.exports.editProfile = async (req, resp) => {
    const {fullname, username, bio} = req.body
    const userId = req.params.userId
    console.log(`body:`, req.body);
    try {
        
        //2. check userId in database
        const CHECK_ID = `SELECT * FROM users WHERE userID = ?;`
        const [ID] = await database.execute(CHECK_ID, [userId])
        console.log(`data User:`, ID);
        if(!ID.length){
            throw new createError(http_status_code.NOT_FOUND, http_status_message.NOT_FOUND)
        }

        //3. check empty value at property
        if(fullname === ""){
            delete req.body.fullname
        }

        if(username === ""){
            delete req.body.username
        }

        if(bio === "")
        delete req.body.bio

        //4. check duplicate username
        if(username !== ID[0].username){
            const CHECK_USERNAME = `SELECT * FROM users WHERE username = ?;`
            const [USERNAME] = await database.execute(CHECK_USERNAME, [username])
            if(USERNAME.length){
                throw new createError(http_status_code.BAD_REQUEST, `Username ${username} has already exist`)
            }
            console.log(`check USERNAME:`, USERNAME);
        }

        //5. do query edit user profile and execute
        let values = []
        //do looping for get properti and value
        for ( let key in req.body) {
            values.push(`${key} = '${req.body[key]}'`)
        const UPDATE_PROFILE = `UPDATE users SET ${values} WHERE userId = ?;`
        const [PROFILE] = await database.execute(UPDATE_PROFILE, [userId])
        console.log(`update profile:`, PROFILE)}

        //6. send respond to client
        const respond = new createRespond(http_status_code.CREATED, http_status_message.CREATED, 'Update user profile', 1, 1, 'Your Profile has been updated')
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
