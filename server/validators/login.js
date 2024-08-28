const Joi = require('joi');


const loginSchema = Joi.object({
    username: Joi
        .string()
        .max(15)
        .required(),

    password: Joi
        .string()
        .min(6)
        .max(127)
        .required()
});

module.exports = loginSchema;