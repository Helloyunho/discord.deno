import { Collection } from '../utils/collection.ts'
import type { Client } from '../client/mod.ts'
import { RequestMethods, METHODS } from './types.ts'
import { Constants } from '../types/constants.ts'
import { RESTEndpoints } from './endpoints.ts'
import { BucketHandler } from './bucket.ts'
import { APIRequest, RequestOptions } from './request.ts'

export type MethodFunction = (
  body?: unknown,
  maxRetries?: number,
  bucket?: string | null,
  rawResponse?: boolean
) => Promise<any>

export interface APIMap extends MethodFunction {
  /** Make a GET request to current route */
  get: APIMap
  /** Make a POST request to current route */
  post: APIMap
  /** Make a PATCH request to current route */
  patch: APIMap
  /** Make a PUT request to current route */
  put: APIMap
  /** Make a DELETE request to current route */
  delete: APIMap
  /** Make a HEAD request to current route */
  head: APIMap
  /** Continue building API Route */
  [name: string]: APIMap
}

/** API Route builder function */
export const builder = (rest: RESTManager, acum = '/'): APIMap => {
  const routes = {}
  const proxy = new Proxy(routes, {
    get: (_, p, __) => {
      if (p === 'toString') return () => acum
      if (METHODS.includes(String(p)) === true) {
        const method = ((rest as unknown) as {
          [name: string]: MethodFunction
        })[String(p)]
        return async (...args: any[]) =>
          await method.bind(rest)(
            `${Constants.DISCORD_API_URL}/v${rest.version}${acum.substring(
              0,
              acum.length - 1
            )}`,
            ...args
          )
      }
      return builder(rest, acum + String(p) + '/')
    }
  })
  return (proxy as unknown) as APIMap
}

export interface RESTOptions {
  /** Token to use for authorization */
  token?: string | (() => string | undefined)
  /** Headers to patch with if any */
  headers?: { [name: string]: string | undefined }
  /** Whether to use Canary instance of Discord API or not */
  canary?: boolean
  /** Discord REST API version to use */
  version?: 6 | 7 | 8
  /** Token Type to use for Authorization */
  tokenType?: TokenType
  /** User Agent to use (Header) */
  userAgent?: string
  /** Optional Harmony client */
  client?: Client
  /** Requests Timeout (in MS, default 30s) */
  requestTimeout?: number
  /** Retry Limit (default 1) */
  retryLimit?: number
}

/** Token Type for REST API. */
export enum TokenType {
  /** Token type for Bot User */
  Bot = 'Bot',
  /** Token Type for OAuth2 */
  Bearer = 'Bearer',
  /** No Token Type. Can be used for User accounts. */
  None = ''
}

/** An easier to use interface for interacting with Discord REST API. */
export class RESTManager {
  /** API Version being used by REST Manager */
  version: number = 8
  /**
   * API Map - easy to use way for interacting with Discord API.
   *
   * Examples:
   * * ```ts
   *   rest.api.users['123'].get().then(userPayload => doSomething)
   *   ```
   * * ```ts
   *   rest.api.guilds['123'].channels.post({ name: 'my-channel', type: 0 }).then(channelPayload => {})
   *   ```
   */
  api: APIMap
  /** Token being used for Authorization */
  token?: string | (() => string | undefined)
  /** Token Type of the Token if any */
  tokenType: TokenType = TokenType.Bot
  /** Headers object which patch the current ones */
  headers: any = {}
  /** Optional custom User Agent (header) */
  userAgent?: string
  /** Whether REST Manager is using Canary API */
  canary?: boolean
  /** Optional Harmony Client object */
  client?: Client
  endpoints: RESTEndpoints
  requestTimeout = 30000
  timers: Set<number> = new Set()
  apiURL = Constants.DISCORD_API_URL

  handlers = new Collection<string, BucketHandler>()
  globalLimit = Infinity
  globalRemaining = this.globalLimit
  globalReset: number | null = null
  globalDelay: number | null = null
  retryLimit = 1
  restTimeOffset = 0

  constructor(options?: RESTOptions) {
    this.api = builder(this)
    if (options?.token !== undefined) this.token = options.token
    if (options?.version !== undefined) this.version = options.version
    if (options?.headers !== undefined) this.headers = options.headers
    if (options?.tokenType !== undefined) this.tokenType = options.tokenType
    if (options?.userAgent !== undefined) this.userAgent = options.userAgent
    if (options?.canary !== undefined) this.canary = options.canary
    if (options?.client !== undefined) this.client = options.client
    if (options?.retryLimit !== undefined) this.retryLimit = options.retryLimit
    if (options?.requestTimeout !== undefined)
      this.requestTimeout = options.requestTimeout
    this.endpoints = new RESTEndpoints(this)
  }

  setTimeout(fn: (...args: any[]) => any, ms: number): number {
    const timer = setTimeout(async () => {
      this.timers.delete(timer)
      await fn()
    }, ms)
    this.timers.add(timer)
    return timer
  }

  async request<T = any>(
    method: RequestMethods,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const req = new APIRequest(this, method, path, options)
    let handler = this.handlers.get(req.path)

    if (handler === undefined) {
      handler = new BucketHandler(this)
      this.handlers.set(req.route, handler)
    }

    return handler.push(req)
  }

  /**
   * Makes a Request to Discord API.
   * @param method HTTP Method to use
   * @param url URL of the Request
   * @param body Body to send with Request
   * @param maxRetries Number of Max Retries to perform
   * @param bucket BucketID of the Request
   * @param rawResponse Whether to get Raw Response or body itself
   */
  async make(
    method: RequestMethods,
    url: string,
    body?: unknown,
    _maxRetries = 0,
    bucket?: string | null,
    rawResponse?: boolean,
    options: RequestOptions = {}
  ): Promise<any> {
    return await this.request(
      method,
      url,
      Object.assign(
        {
          data: body,
          rawResponse,
          route: bucket ?? undefined
        },
        options
      )
    )
  }

  /** Makes a GET Request to API */
  async get(
    url: string,
    body?: unknown,
    maxRetries = 0,
    bucket?: string | null,
    rawResponse?: boolean,
    options?: RequestOptions
  ): Promise<any> {
    return await this.make(
      'get',
      url,
      body,
      maxRetries,
      bucket,
      rawResponse,
      options
    )
  }

  /** Makes a POST Request to API */
  async post(
    url: string,
    body?: unknown,
    maxRetries = 0,
    bucket?: string | null,
    rawResponse?: boolean,
    options?: RequestOptions
  ): Promise<any> {
    return await this.make(
      'post',
      url,
      body,
      maxRetries,
      bucket,
      rawResponse,
      options
    )
  }

  /** Makes a DELETE Request to API */
  async delete(
    url: string,
    body?: unknown,
    maxRetries = 0,
    bucket?: string | null,
    rawResponse?: boolean,
    options?: RequestOptions
  ): Promise<any> {
    return await this.make(
      'delete',
      url,
      body,
      maxRetries,
      bucket,
      rawResponse,
      options
    )
  }

  /** Makes a PATCH Request to API */
  async patch(
    url: string,
    body?: unknown,
    maxRetries = 0,
    bucket?: string | null,
    rawResponse?: boolean,
    options?: RequestOptions
  ): Promise<any> {
    return await this.make(
      'patch',
      url,
      body,
      maxRetries,
      bucket,
      rawResponse,
      options
    )
  }

  /** Makes a PUT Request to API */
  async put(
    url: string,
    body?: unknown,
    maxRetries = 0,
    bucket?: string | null,
    rawResponse?: boolean,
    options?: RequestOptions
  ): Promise<any> {
    return await this.make(
      'put',
      url,
      body,
      maxRetries,
      bucket,
      rawResponse,
      options
    )
  }
}
