import InvariantError from '../../exceptions/InvariantError'
import { CollaborationPayloadSchema } from './schema'

const CollaborationsValidator = {
  validateCollaborationPayload: (payload: unknown) => {
    const validationResult = CollaborationPayloadSchema.validate(payload)

    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

export default CollaborationsValidator
