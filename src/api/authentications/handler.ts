import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import ClientError from '../../exceptions/ClientError'
import type AuthenticationsService from '../../services/postgres/AuthenticationsService'
import type UsersService from '../../services/postgres/UsersService'
import type TokenManager from '../../tokenize/TokenManager'
import type AuthenticationsValidator from '../../validator/authentications'
import type { UserPayload } from '../../types/user'
import autoBind from 'auto-bind'

class AuthenticationsHandler {
  private readonly _authenticationsService: AuthenticationsService
  private readonly _usersService: UsersService
  private readonly _tokenManager: typeof TokenManager
  private readonly _validator: typeof AuthenticationsValidator

  constructor (
    authenticationsService: AuthenticationsService,
    usersService: UsersService,
    tokenManager: typeof TokenManager,
    validator: typeof AuthenticationsValidator
  ) {
    this._authenticationsService = authenticationsService
    this._usersService = usersService
    this._tokenManager = tokenManager
    this._validator = validator

    autoBind(this)
  }

  async postAuthenticationHandler (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload)

      const { username, password } = request.payload as UserPayload
      const id = await this._usersService.verifyUserCredential(username, password)

      const accessToken = this._tokenManager.generateAccessToken({ id })
      const refreshToken = this._tokenManager.generateRefreshToken({ id })

      await this._authenticationsService.addRefreshToken(refreshToken)

      const response = h.response({
        status: 'success',
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken
        }
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async putAuthenticationHandler (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    try {
      this._validator.validatePutAuthenticationPayload(request.payload)

      const { refreshToken } = request.payload as { refreshToken: string }
      await this._authenticationsService.verifyRefreshToken(refreshToken)
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken)

      const accessToken = this._tokenManager.generateAccessToken({ id })
      return h.response({
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken
        }
      })
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async deleteAuthenticationHandler (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload)

      const { refreshToken } = request.payload as { refreshToken: string }
      await this._authenticationsService.verifyRefreshToken(refreshToken)
      await this._authenticationsService.deleteRefreshToken(refreshToken)

      return h.response({
        status: 'success',
        message: 'Refresh token berhasil dihapus'
      })
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

export default AuthenticationsHandler
