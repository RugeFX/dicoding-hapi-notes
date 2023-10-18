import {Pool} from 'pg';
import InvariantError from '../../exceptions/InvariantError';

interface IAuthenticationsService {
    addRefreshToken(token: string): Promise<void>;

    verifyRefreshToken(token: string): Promise<void>;

    deleteRefreshToken(token: string): Promise<void>;
}

class AuthenticationsService implements IAuthenticationsService {
    private _pool: Pool;

    constructor() {
        this._pool = new Pool();
    }

    async addRefreshToken(token: string) {
        const query = {
            text: 'INSERT INTO authentications VALUES($1)',
            values: [token],
        };

        await this._pool.query(query);
    }

    async verifyRefreshToken(token: string) {
        const query = {
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [token],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Refresh token tidak valid');
        }
    }

    async deleteRefreshToken(token: string) {
        const query = {
            text: 'DELETE FROM authentications WHERE token = $1',
            values: [token],
        };

        await this._pool.query(query);
    }
}

export default AuthenticationsService;
