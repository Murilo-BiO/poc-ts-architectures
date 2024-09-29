import fastify from "fastify"
import { fastifyCookie } from "@fastify/cookie"
import { fastifySession } from "@fastify/session"
import { User } from "user/entities"
import pretty from 'pino-pretty'

// Extend fastify.session with your custom type.
declare module "fastify" {
  interface Session {
    userId: User['id']
  }
}

export const makeServer = () => {
  const stream = pretty({
    colorize: true,
  })

  const server = fastify({
    logger: {
      level: 'info',
      stream: process.env.NODE_ENV === 'development' ? stream : undefined
    },
    disableRequestLogging: true,
  })

  server.register(fastifyCookie)
  server.register(fastifySession, {
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 5 * 60 * 1000,
      secure: false,
      httpOnly: true,
    }
  })

  server.get("/healthcheck", (_, res) => res.send({ message: "healthy" }))

  return server
}
