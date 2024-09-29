import { FastifyInstance } from "fastify"
import { customerCreationPayloadSchema, customerIdSchema, customerUpdatePayloadSchema } from "./entities"
import { AlreadyExistsError, BaseError, ensureError, NotFoundError, ParsingError, UnexpectedCollisionError } from "utils/error"
import { only } from "utils/only"
import type { CustomerCreationUsecase } from "./usecases/create-customer"
import type { CustomerUpdateUsecase } from "./usecases/update-customer"

export function registerCustomerRoutes(deps: {
  httpServer: FastifyInstance,
  customerCreation: CustomerCreationUsecase
  customerUpdate: CustomerUpdateUsecase
}) {
  const { httpServer: app } = deps

  app.route({
    method: 'POST',
    url: '/customers',
    preHandler: (req, res, done) => {
      if (!req.session.userId)
        res.status(401).send({ message: 'Unauthenticated' })

      done()
    },
    handler: async (req, res) => {
      const result = await customerCreationPayloadSchema
        .parse(req.body)
        .andThenAsync(dto =>
          deps.customerCreation.execute(req.session.userId, dto)
        )

      if (result.isErr()) {
        const error = result.unwrapErr() as BaseError
        if (error instanceof ParsingError)
          return res.status(400).send({ issues: error.context })
        if (error instanceof AlreadyExistsError)
          return res.status(422).send({ message: 'Customer with same name already exists.' })
        if (error instanceof UnexpectedCollisionError)
          return res.status(503).send({ message: 'Try again later.' })

        req.log.error(error)
        return res.status(500).send({ message: 'Internal Server Error' })
      }

      return res.status(200).send({ customerId: result.unwrap() })
    }
  })

  app.route<{ Params: { customerId: string } }>({
    method: 'PATCH',
    url: '/customers/:customerId',
    preHandler: (req, res, done) => {
      if (!req.session.userId)
        res.status(401).send({ message: 'Unauthenticated' })
      done()
    },
    handler: async (req, res) => {
      const userId = req.session.userId
      const customerIdParse = customerIdSchema.parse2(req.params.customerId)
      const bodyParseResult = customerUpdatePayloadSchema.parse2(req.body)
      
      if (!customerIdParse.success)
        return res.status(400).send({
          message: req.params.customerId ? 'Invalid customerId in URL params' : 'Missing customerId in URL params',
          issues: customerIdParse.error.context
        })

      if (!bodyParseResult.success)
        return res.status(400).send({
          message: req.body ? 'Invalid Payload' : 'Request Body is required',
          issues: bodyParseResult.error.context
        })

      try {
        await deps.customerUpdate.execute({
          userId,
          customerId: customerIdParse.data,
          payload: bodyParseResult.data
        })

        return res.status(204).send()
      } catch (e) {
        const error = ensureError(e)
        req.log.debug(error)

        if (error instanceof AlreadyExistsError)
          return res.status(422).send(only(error, 'message'))
        if (error instanceof NotFoundError)
          return res.status(404).send({ message: 'Resource Not Found' })

        req.log.error(error)
        return res.status(500).send({ message: 'Internal Server Error' })
      }
    }
  })

}
