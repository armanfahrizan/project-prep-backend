const joi = require('joi')
const passwordValidator = require('password-validator')

const registerUserSchema = joi.object({
    fullname: joi.string().min(2).max(50).required(),
    username: joi.string().min(6).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).pattern(/[!@#$%^&*_!]/).required(),
    repassword: joi.any().equal(joi.ref('password')).label('Confirm password').messages({'any only':'{{#label}} does not match'}).required()
})

const loginUserSchema = joi.object({
    username: joi.string().min(6).max(15),
    password: joi.string().min(8).pattern(/[!@#$%^&*_!]/)
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

const passwordSchema =  new passwordValidator();
passwordSchema
.is().min(8, 'Password should have a minimun 8 chacracters')
.has().uppercase(1, 'Password should have a minimun 1 uppercase letter')
.has().digits(1, 'Password should have a minimun 1 digit letter')
.has().not().spaces(1, 'Password should not have spaces')

module.exports = {registerUserSchema, loginUserSchema, passwordSchema, editUserSchema, resetPasswordSchema}