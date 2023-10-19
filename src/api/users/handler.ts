import ClientError from '../../exceptions/ClientError'
import autoBind from 'auto-bind'
import type UsersService from '../../services/postgres/UsersService'
import type UsersValidator from '../../validator/users'
import type { BaseHandler } from '../../types/handler'
import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import type { UserPayload } from '../../types/user'

interface IUsersHandler {
  postUserHandler: BaseHandler
  getUserByIdHandler: BaseHandler
  getUsersByUsernameHandler: BaseHandler
}

class UsersHandler implements IUsersHandler {
  _service: UsersService
  _validator: typeof UsersValidator

  constructor (service: UsersService, validator: typeof UsersValidator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postUserHandler (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    try {
      this._validator.validateUserPayload(request.payload)
      const { username, password, fullname } = request.payload as UserPayload

      const userId = await this._service.addUser({ username, password, fullname })

      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId
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

  async getUserByIdHandler (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    try {
      const { id } = request.params

      const user = await this._service.getUserById(id)

      return h.response({
        status: 'success',
        data: {
          user
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

      // server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async getUsersByUsernameHandler (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    try {
      const { username = '' } = request.query
      const users = await this._service.getUsersByUsername(username)
      return h.response({
        status: 'success',
        data: {
          users
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
}

export default UsersHandler
