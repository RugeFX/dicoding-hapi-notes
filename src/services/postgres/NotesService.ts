import {Pool, type QueryConfig} from 'pg'
import {nanoid} from 'nanoid'
import {mapDBToModel} from "../../utils";
import InvariantError from "../../exceptions/InvariantError";
import NotFoundError from "../../exceptions/NotFoundError";
import AuthorizationError from "../../exceptions/AuthorizationError";
import type {NotePayload, Note} from "../../types/note";

class NotesService {
    private _pool: Pool

    constructor() {
        this._pool = new Pool()
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
            text: 'SELECT * FROM notes WHERE owner = $1',
            values: [owner]
        }
        const result = await this._pool.query<Note>(query)
        return result.rows.map(mapDBToModel)
    }

    async getNoteById(id: string) {
        const query = {
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id]
        }
        const result = await this._pool.query<Note>(query)

        if (!result.rowCount) {
            throw new NotFoundError('Catatan tidak ditemukan')
        }

        return result.rows.map(mapDBToModel)[0]
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
}

export default NotesService
