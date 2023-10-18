import {
    DeleteAuthenticationPayloadSchema,
    PostAuthenticationPayloadSchema,
    PutAuthenticationPayloadSchema
} from "./schema";
import InvariantError from "../../exceptions/InvariantError";

const AuthenticationsValidator = {
    validatePostAuthenticationPayload: (payload: unknown) => {
        const validationResult = PostAuthenticationPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validatePutAuthenticationPayload: (payload: unknown) => {
        const validationResult = PutAuthenticationPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateDeleteAuthenticationPayload: (payload: unknown) => {
        const validationResult = DeleteAuthenticationPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

export default AuthenticationsValidator
