import type CollaborationsHandler from './handler'
import type { ServerRoute } from '@hapi/hapi'

const routes = (handler: CollaborationsHandler): ServerRoute[] => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    options: {
      auth: 'notesapp_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'notesapp_jwt'
    }
  }
]

export default routes
