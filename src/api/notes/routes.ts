import type NotesHandler from "./handler";
import {ServerRoute} from "@hapi/hapi";

const routes = (handler: NotesHandler): ServerRoute[] => [
    {
        method: 'POST',
        path: '/notes',
        handler: handler.postNoteHandler,
        options: {
            auth: 'notesapp_jwt'
        }
    },
    {
        method: 'GET',
        path: '/notes',
        handler: handler.getNotesHandler,
        options: {
            auth: 'notesapp_jwt'
        }
    },
    {
        method: 'GET',
        path: '/notes/{id}',
        handler: handler.getNoteByIdHandler,
        options: {
            auth: 'notesapp_jwt'
        }
    },
    {
        method: 'PUT',
        path: '/notes/{id}',
        handler: handler.putNoteByIdHandler,
        options: {
            auth: 'notesapp_jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/notes/{id}',
        handler: handler.deleteNoteByIdHandler,
        options: {
            auth: 'notesapp_jwt'
        }
    }
]

export default routes
