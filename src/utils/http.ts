export type HttpMethod = 
  | 'OPTIONS'
  | 'HEAD'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'

export type HttpPath = string

export type HttpEndpoint = [HttpMethod, HttpPath, HttpHandler]

export type HttpHandler<Params = unknown> = (ctx: RequestContext<Params>) => Response | Promise<Response>

export class RequestContext<Params = unknown> {
  constructor(
    public readonly params: Params,
    public readonly request: Request,
    public readonly cookies: Map<string, string>,
    public responseInit: ResponseInit,
  ) {}

  responseStatus(status: number): this {
    this.responseInit = {
      ...this.responseInit,
      status,
    }
    return this
  }

  jsonResponse<T>(data: T): Response {
    return new Response(JSON.stringify(data), this.responseInit)
  }

  emptyResponse(): Response {
    return new Response(null, this.responseInit)
  }
}

export type HttpServer = {
  listen(config: { host: string, port: number }): Promise<void>
  addEndpoint<Params = unknown>(method: HttpMethod, path: HttpPath, handler: HttpHandler<Params>): HttpServer
}
