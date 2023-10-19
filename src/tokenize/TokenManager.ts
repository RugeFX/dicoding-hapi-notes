import Jwt from '@hapi/jwt'
import InvariantError from '../exceptions/InvariantError'

interface TokenPayload {
  id: string
}

const TokenManager = {
  generateAccessToken: (payload: TokenPayload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY as string),
  generateRefreshToken: (payload: TokenPayload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY as string),
  verifyRefreshToken: (refreshToken: string) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY as string)
      const { payload } = artifacts.decoded
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }
}

export default TokenManager
