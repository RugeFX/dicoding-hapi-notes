import 'dotenv/config'

import * as Hapi from '@hapi/hapi'
import Jwt, { type HapiJwt } from '@hapi/jwt'
// Notes
import notes from './api/notes'
import NotesService from './services/postgres/NotesService'
import NotesValidator from './validator/notes'
// Users
import users from './api/users'
import UsersService from './services/postgres/UsersService'
import UsersValidator from './validator/users'
// Authentications
import authentications from './api/authentications'
import AuthenticationsService from './services/postgres/AuthenticationsService'
import TokenManager from './tokenize/TokenManager'
import AuthenticationsValidator from './validator/authentications'
// Collaborations
import collaborations from './api/collaborations'
import CollaborationsService from './services/postgres/CollaborationsService'
import CollaborationsValidator from './validator/collaborations'

const init = async (): Promise<void> => {
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService()
  const notesService = new NotesService(collaborationsService)

  const server = Hapi.server({
    port: process.env.PORT as string,
    host: process.env.HOST as string,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    }
  ])

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY as string,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Number(process.env.ACCESS_TOKEN_AGE)
    },
    validate: async (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id as string
      }
    })
  } satisfies HapiJwt.Options)

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator
      }
    }
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

void init()
