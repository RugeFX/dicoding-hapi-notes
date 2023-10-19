import type CollaborationsService from '../../services/postgres/CollaborationsService'
import type CollaborationsValidator from '../../validator/collaborations'
import type NotesService from "../../services/postgres/NotesService";
import type {Request, ResponseToolkit} from "@hapi/hapi";
import ClientError from "../../exceptions/ClientError";
import autoBind from "auto-bind";

type CollaborationsPayload = { noteId: string; userId: string }

class CollaborationsHandler {
    private _collaborationsService: CollaborationsService
    private _notesService: NotesService
    private _validator: typeof CollaborationsValidator

    constructor(collaborationsService: CollaborationsService, notesService: NotesService, validator: typeof CollaborationsValidator) {
        this._collaborationsService = collaborationsService;
        this._notesService = notesService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request: Request, h: ResponseToolkit) {
        try {
            this._validator.validateCollaborationPayload(request.payload);
            const {id: credentialId} = request.auth.credentials as { id: string };
            const {noteId, userId} = request.payload as CollaborationsPayload;

            await this._notesService.verifyNoteOwner(noteId, credentialId);
            const collaborationId = await this._collaborationsService.addCollaboration(noteId, userId);

            const response = h.response({
                status: 'success',
                message: 'Kolaborasi berhasil ditambahkan',
                data: {
                    collaborationId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteCollaborationHandler(request: Request, h: ResponseToolkit) {
        try {
            this._validator.validateCollaborationPayload(request.payload);
            const {id: credentialId} = request.auth.credentials as { id: string };
            const {noteId, userId} = request.payload as CollaborationsPayload;

            await this._notesService.verifyNoteOwner(noteId, credentialId);
            await this._collaborationsService.deleteCollaboration(noteId, userId);

            return {
                status: 'success',
                message: 'Kolaborasi berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

export default CollaborationsHandler
