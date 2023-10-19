import UsersHandler from './handler'
import routes from './routes'
import type { Server } from '@hapi/hapi'

export default {
  name: 'users',
  version: '1.0.0',
  register: async (server: Server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator)
    server.route(routes(usersHandler))
  }
}
