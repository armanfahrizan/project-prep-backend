const joi = require('joi')
const passwordValidator = require('password-validator')

const passwordSchema =  new passwordValidator();
passwordSchema
.is().min(8, 'Password should have minimum 8 chacracters')
.has().uppercase(1, 'Password should have minimum 1 uppercase letter')
.has().digits(1, 'Password should have minimum 1 digit letter')
.has().not().spaces(1, 'Password should not have spaces')
.has().symbols(1, 'Password should have minimum 1 symbol ')

const usernameSchema = new passwordValidator();
usernameSchema
.has().digits(1, 'Username should have minimum 1 digit letter')
.is().min(6, 'Username should have minimum 6 characters')
.is().max(15, 'Too long, username has to maximum 15 characters')


const fullnameSchema = new passwordValidator()
fullnameSchema
.is().min(6, 'Username should have minimum 6 characters')
.is().max(30, 'Too long, username has to maximum 15 characters')

const bioSchema = new passwordValidator()
bioSchema
.is().min(1, 'Username should have minimum 6 characters')
.is().max(200, 'Sorry, only can fill maximum 200 characters')


const registerUserSchema = joi.object({
    fullname: joi.string().min(2).max(30).required(),
    username: [joi.string().min(6).max(15).required(),joi.number().min(1).required()],
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    repassword: joi.any().equal(joi.ref('password')).label('Confirm password').messages({'any only':'{{#label}} does not match'}).required()
})

const loginUserSchema = joi.object({
    username: joi.string().min(6).alphanum(),
    password: joi.string().min(8)
})

const editUserSchema = joi.object({
    fullname: joi.string().min(2).max(50),
    username: joi.string().min(6).max(15),
    bio: joi.string().max(512)
})

const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).pattern(/[!@#$%^&*_!]/).required(),
    repassword: joi.any().equal(joi.ref('password')).label('Confirm password').messages({'any only':'{{#label}} does not match'}).required()
})


module.exports = {registerUserSchema, loginUserSchema, passwordSchema, usernameSchema, fullnameSchema, bioSchema, resetPasswordSchema}