import type {Request, ResponseToolkit} from "@hapi/hapi"
import autoBind from "auto-bind";
import NotesValidator from "../../validator/notes"
import ClientError from "../../exceptions/ClientError";
import type NotesService from "../../services/postgres/NotesService";
import type {Note, NotePayload} from "../../types/note";
import type {BaseHandler} from "../../types/handler";

interface INotesHandler {
    postNoteHandler: BaseHandler
    getNotesHandler: BaseHandler
    getNoteByIdHandler: BaseHandler
    putNoteByIdHandler: BaseHandler
    deleteNoteByIdHandler: BaseHandler
}

class NotesHandler implements INotesHandler {
    private _service: NotesService
    private _validator: typeof NotesValidator

    constructor(service: NotesService, validator: typeof NotesValidator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postNoteHandler(request: Request, h: ResponseToolkit) {
        try {
            this._validator.validateNotePayload(request.payload as NotePayload)
            const {title, body, tags} = request.payload as Omit<NotePayload, "owner">
            const {id: credentialId} = request.auth.credentials as { id: string }
            const noteId = await this._service.addNote({
                title, body, tags, owner: credentialId
            })

            const response = h.response({
                status: 'success',
                message: 'Catatan berhasil ditambahkan',
                data: {
                    noteId
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

    async getNotesHandler(request: Request) {
        const {id: credentialId} = request.auth.credentials as { id: string }
        const notes = await this._service.getNotes(credentialId)
        return {
            status: 'success',
            data: {
                notes
            }
        }
    }

    async getNoteByIdHandler(request: Request, h: ResponseToolkit) {
        try {
            const {id} = request.params;
            const {id: credentialId} = request.auth.credentials as { id: string };

            await this._service.verifyNoteAccess(id, credentialId);
            const note = await this._service.getNoteById(id);
            return {
                status: 'success',
                data: {
                    note,
                },
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

    async putNoteByIdHandler(request: Request, h: ResponseToolkit) {
        try {
            this._validator.validateNotePayload(request.payload);
            const {id} = request.params;
            const {id: credentialId} = request.auth.credentials as { id: string };

            await this._service.verifyNoteAccess(id, credentialId);
            await this._service.editNoteById(id, request.payload as NotePayload);
            return {
                status: 'success',
                message: 'Catatan berhasil diperbarui',
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

    async deleteNoteByIdHandler(request: Request, h: ResponseToolkit) {
        try {
            const {id} = request.params
            const {id: credentialId} = request.auth.credentials as { id: string }
            await this._service.verifyNoteOwner(id, credentialId)
            await this._service.deleteNoteById(id)

            return {
                status: 'success',
                message: 'Catatan berhasil dihapus'
            }
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

export default NotesHandler
