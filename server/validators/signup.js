const Joi = require('joi');


const signUpSchema = Joi.object({
    name: Joi
        .string()
        .min(3)
        .max(100)
        .required(),

    username: Joi
        .string()
        .min(3)
        .max(15)
        .required(),

    password: Joi
        .string()
        .min(6)
        .max(127)
        .required()
});

module.exports = signUpSchema;