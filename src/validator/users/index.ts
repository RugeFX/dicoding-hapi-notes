import InvariantError from '../../exceptions/InvariantError'
import { UserPayloadSchema } from './schema'

const UsersValidator = {
  validateUserPayload: (payload: unknown) => {
    const validationResult = UserPayloadSchema.validate(payload)

    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

export default UsersValidator
