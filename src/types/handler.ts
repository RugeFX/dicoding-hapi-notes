import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import type { JSONValue } from './json'

export type BaseHandler = (request?: Request, h?: ResponseToolkit) => Promise<ResponseObject | JSONValue>
