import {Pool, type QueryConfig} from 'pg'
import {nanoid} from 'nanoid'
import {mapDBToModel} from "../../utils";
import InvariantError from "../../exceptions/InvariantError";
import NotFoundError from "../../exceptions/NotFoundError";
import AuthorizationError from "../../exceptions/AuthorizationError";
import type {NotePayload, Note, MappedNote} from "../../types/note";
import type CollaborationsService from "./CollaborationsService";

interface INotesService {
    addNote(noteData: NotePayload): Promise<string>;

    getNotes(owner: string): Promise<MappedNote[]>;

    getNoteById(id: string): Promise<MappedNote>;

    editNoteById(id: string, noteData: Omit<NotePayload, 'owner'>): Promise<void>;

    deleteNoteById(id: string): Promise<void>;

    verifyNoteOwner(id: string, owner: string): Promise<void>;

    verifyNoteAccess(noteId: string, userId: string): Promise<void>;
}

class NotesService implements INotesService {
    private _pool: Pool
    private _collaborationService: CollaborationsService

    constructor(collaborationService: CollaborationsService) {
        this._pool = new Pool()
        this._collaborationService = collaborationService;
    }

    async addNote({title, body, tags, owner}: NotePayload) {
        const id = nanoid(16)
        const createdAt = new Date().toISOString()
        const updatedAt = createdAt

        const query: QueryConfig<(string | string[])[]> = {
            text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, body, tags, createdAt, updatedAt, owner]
        }

        const result = await this._pool.query<{ id: string }>(query)

        if (!result.rows[0].id) {
            throw new InvariantError('Catatan gagal ditambahkan')
        }

        return result.rows[0].id
    }

    async getNotes(owner: string) {
        const query = {
            text: `SELECT notes.* FROM notes
                    LEFT JOIN collaborations ON collaborations.note_id = notes.id
                    WHERE notes.owner = $1 OR collaborations.user_id = $1
                    GROUP BY notes.id`,
            values: [owner],
        };
        const result = await this._pool.query<Note>(query);
        return result.rows.map(mapDBToModel);
    }

    async getNoteById(id: string) {
        const query = {
            text: `SELECT notes.*, users.username
                    FROM notes
                    LEFT JOIN users ON users.id = notes.owner
                    WHERE notes.id = $1`,
            values: [id],
        };
        const result = await this._pool.query<Note>(query);

        if (!result.rows.length) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        return result.rows.map(mapDBToModel)[0];
    }

    async editNoteById(id: string, {title, body, tags}: Omit<NotePayload, "owner">) {
        const updatedAt = new Date().toISOString()
        const query = {
            text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
            values: [title, body, tags, updatedAt, id]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan')
        }
    }

    async deleteNoteById(id: string) {
        const query = {
            text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
            values: [id]
        }

        const result = await this._pool.query<{ id: string }>(query)

        if (!result.rowCount) {
            throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan')
        }
    }

    async verifyNoteOwner(id: string, owner: string) {
        const query = {
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id]
        }

        const result = await this._pool.query<Note>(query)

        if (!result.rowCount) {
            throw new NotFoundError('Resource yang Anda minta tidak ditemukan')
        }

        const note = result.rows[0]

        if (note.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
        }
    }

    async verifyNoteAccess(noteId: string, userId: string) {
        try {
            await this.verifyNoteOwner(noteId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationService.verifyCollaborator(noteId, userId);
            } catch {
                throw error;
            }
        }
    }
}

export default NotesService
