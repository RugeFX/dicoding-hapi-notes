import * as Joi from 'joi'

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required()
})

export { UserPayloadSchema }
