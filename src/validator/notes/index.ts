import { NotePayloadSchema } from './schema'
import InvariantError from '../../exceptions/InvariantError'

const NotesValidator = {
  validateNotePayload: (payload: unknown) => {
    const validationResult = NotePayloadSchema.validate(payload)
    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

export default NotesValidator
