import AuthenticationsHandler from './handler'
import routes from './routes'
import type { Server } from '@hapi/hapi'

export default {
  name: 'authentications',
  version: '1.0.0',
  register: async (server: Server, {
    authenticationsService,
    usersService,
    tokenManager,
    validator
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      tokenManager,
      validator
    )
    server.route(routes(authenticationsHandler))
  }
}
