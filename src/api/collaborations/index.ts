import CollaborationsHandler from './handler'
import routes from './routes'
import type {Server} from '@hapi/hapi'

export default {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server: Server, {collaborationsService, notesService, validator}) => {
        const collaborationsHandler = new CollaborationsHandler(
            collaborationsService, notesService, validator
        );
        server.route(routes(collaborationsHandler));
    }
}
