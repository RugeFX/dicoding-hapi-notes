import routes from './routes'
import type { Server } from '@hapi/hapi'
import NotesHandler from './handler'
import type NotesService from '../../services/postgres/NotesService'
import type NotesValidator from '../../validator/notes'

export default {
  name: 'notes',
  version: '1.0.0',
  register: async (server: Server, { service, validator }: { service: NotesService, validator: typeof NotesValidator }) => {
    const notesHandler = new NotesHandler(service, validator)
    server.route(routes(notesHandler))
  }
}
