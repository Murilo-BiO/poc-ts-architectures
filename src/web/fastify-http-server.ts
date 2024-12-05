import fastify, { FastifyInstance, FastifyRequest } from "fastify"
import { fastifyCookie } from '@fastify/cookie'
import pretty from 'pino-pretty'
import { Readable } from "node:stream"
import { HttpServer, HttpMethod, HttpPath, HttpHandler, RequestContext } from "utils/http"

export class FastifyHttpServer implements HttpServer {
  private readonly server: FastifyInstance

  constructor(private readonly defaultResponseHeaders: Headers = new Headers()) {
    const isDevEnv = process.env.NODE_ENV === 'development'
    const stream = pretty({
      colorize: true,
    })

    this.server = fastify({
      logger: {
        level: isDevEnv ? 'debug' : 'info',
        stream: isDevEnv ? stream : undefined
      },
      disableRequestLogging: true,
    })

    this.server.register(fastifyCookie)

    this.server.get("/healthcheck", (_, res) => res.send({ message: "healthy" }))
  }

  async listen(config: { host: string, port: number }) {
    await this.server.listen({
      host: config.host,
      port: config.port,
    })
  }

  addEndpoint<Params = unknown>(method: HttpMethod, path: HttpPath, handler: HttpHandler<Params>): HttpServer {
    this.server.route({
      method,
      url: path,
      onRequest: async (req, rep) => {
        const url = `${req.protocol}://${req.host}${req.url}`

        const request = new Request(url, {
          method: req.method,
          body: [
            'GET',
            'HEAD',
          ].includes(req.method) ? undefined : req.raw,
          headers: this.adaptHeaders(req),
          referrer: req.headers.referer,
          duplex: "half",
          credentials: "include",
        })

        const cookies: RequestContext['cookies'] = new Map(Object.entries(req.cookies) as [string, string][])
        
        const { params } = req

        // No try catch here. Just let it crash for now. May be changed later
        const response = await handler(new RequestContext<Params>(
          params as Params,
          request,
          cookies,
          {
            headers: new Headers(this.defaultResponseHeaders)
          }
        ))

        response.headers.forEach((val, key) => {
          rep.header(key, val)
        })
  
        rep.status(response.status)
          .send(response.body
            ? Readable.fromWeb(response.body)
            : undefined
          )
        
        // Stop the lifecycle. We got everything we needed
        rep.hijack()
      },
      handler: async (req, rep) => {
        // If there's a failure and the onRequest hook fails, use this handler to log the problem.

        req.log.error({}, "Failed to hijack the request with the onRequest hook.")
        rep.status(500).send({
          message: "Internal Error. Try again later."
        })
      }
    })
    return this
  }

  private adaptHeaders(req: FastifyRequest): Headers {
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, val]) => {
      if (!val) return
      Array.isArray(val)
        ? val.forEach(v => headers.append(key, v))
        : headers.append(key, val)
    })
    return headers
  }
}
