import {Pool} from 'pg';
import {nanoid} from "nanoid";
import InvariantError from "../../exceptions/InvariantError";

interface ICollaborationsService {
    addCollaboration(noteId: string, userId: string): Promise<string>

    deleteCollaboration(noteId: string, userId: string): Promise<void>

    verifyCollaborator(noteId: string, userId: string): Promise<void>
}

class CollaborationsService implements ICollaborationsService {
    private _pool: Pool

    constructor() {
        this._pool = new Pool();
    }

    async addCollaboration(noteId: string, userId: string) {
        const id = `collab-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, noteId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }
        return result.rows[0].id as string;
    }

    async deleteCollaboration(noteId: string, userId: string) {
        const query = {
            text: 'DELETE FROM collaborations WHERE note_id = $1 AND user_id = $2 RETURNING id',
            values: [noteId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    async verifyCollaborator(noteId: string, userId: string) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE note_id = $1 AND user_id = $2',
            values: [noteId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Kolaborasi gagal diverifikasi');
        }
    }
}

export default CollaborationsService
