import { Pool } from 'pg'
import InvariantError from '../../exceptions/InvariantError'
import NotFoundError from '../../exceptions/NotFoundError'
import AuthenticationError from '../../exceptions/AuthenticationError'
import { nanoid } from 'nanoid'
import { hash, compare } from 'bcrypt'
import type { User, UserPayload } from '../../types/user'

interface UserServiceInterface {
  addUser: (data: UserPayload) => Promise<string>

  getUserById: (userId: string) => Promise<Omit<User, 'password'>>

  verifyNewUsername: (username: string) => Promise<void>

  verifyUserCredential: (username: string, password: string) => Promise<string>

  getUsersByUsername: (username: string) => Promise<User[]>
}

class UsersService implements UserServiceInterface {
  private readonly _pool: Pool

  constructor () {
    this._pool = new Pool()
  }

  async addUser (data: { username: string, password: string, fullname: string }): Promise<string> {
    await this.verifyNewUsername(data.username)

    const id = `user-${nanoid(16)}`
    const hashedPassword = await hash(data.password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, data.username, hashedPassword, data.fullname]
    }

    const result = await this._pool.query(query)

    if (result.rowCount === 0) {
      throw new InvariantError('User gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async getUserById (userId: string): Promise<{ id: string, username: string, fullname: string }> {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount === 0) {
      throw new NotFoundError('User tidak ditemukan')
    }

    return result.rows[0]
  }

  async verifyNewUsername (username: string): Promise<void> {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this._pool.query(query)

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
    }
  }

  async verifyUserCredential (username: string, password: string): Promise<string> {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this._pool.query(query)

    if (result.rowCount === 0) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    const { id, password: hashedPassword } = result.rows[0]

    const match = await compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }
    return id
  }

  async getUsersByUsername (username: string): Promise<User[]> {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`]
    }
    const result = await this._pool.query<User>(query)
    return result.rows
  }
}

export default UsersService
