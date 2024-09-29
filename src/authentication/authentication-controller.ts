import { FastifyInstance } from "fastify";

export function registerAuthenticationRoutes(deps: {
  httpServer: FastifyInstance,
}) {
  const { httpServer: app } = deps

  app.post('/login', (req, res) => {
    req.session.set('userId', 'murilo')
    res.status(200).send({
      message: 'Successfully authenticated!'
    })
  })
}
