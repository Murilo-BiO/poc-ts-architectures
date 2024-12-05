import { customerCreationPayloadSchema, customerIdSchema, customerUpdatePayloadSchema } from "../customer-entities"
import { AlreadyExistsError, BaseError, ensureError, NotFoundError, ParsingError, UnexpectedCollisionError } from "utils/error"
import { only } from "utils/only"
import type { CustomerCreationUsecase } from "../usecases/create-customer"
import type { CustomerUpdateUsecase } from "../usecases/update-customer"
import { Interface } from "utils/type"
import { CustomerDeletionUsecase } from "../usecases/delete-customer"
import { HttpServer, RequestContext } from "utils/http"
import { err, ok } from "utils/result"

export function registerCustomerRoutes(deps: {
  httpServer: HttpServer,
  customerCreation: Interface<CustomerCreationUsecase>
  customerUpdate: Interface<CustomerUpdateUsecase>
  customerDeletion: Interface<CustomerDeletionUsecase>
}) {
  const { httpServer: server } = deps

  server.addEndpoint('POST', '/customers', createCustomer)
  server.addEndpoint('PATCH', '/customers/:customerId', updateCustomer)
  server.addEndpoint('DELETE', '/customers/:customerId', deleteCustomer)

  async function createCustomer(ctx: RequestContext): Promise<Response> {
    const userId = 'murilo'

    const bodyParseResult = await ctx.request.json()
      .then(json => ok(json))
      .catch(error => err(ensureError(error)))

    if (bodyParseResult.isErr()) {
      const error = bodyParseResult.unwrapErr()
      console.error(error)
      return ctx.responseStatus(500)
        .jsonResponse({ message: "Failed to process the request's body" })
    }

    const result = await bodyParseResult
      .andThen(body => customerCreationPayloadSchema.parse(body))
      .andThenAsync(dto => deps.customerCreation.execute(userId, dto))

    if (result.isErr()) {
      const error = result.unwrapErr() as BaseError
      if (error instanceof ParsingError)
        return ctx.responseStatus(400).jsonResponse({ issues: error.context })
      if (error instanceof AlreadyExistsError)
        return ctx.responseStatus(422).jsonResponse({ message: 'Customer with same name already exists.' })
      if (error instanceof UnexpectedCollisionError)
        return ctx.responseStatus(503).jsonResponse({ message: 'Try again later.' })

      console.error(error)
      return ctx.responseStatus(500).jsonResponse({ message: 'Internal Server Error' })
    }

    return ctx.responseStatus(200).jsonResponse({ customerId: result.unwrap() })
  }

  async function updateCustomer(ctx: RequestContext<{ customerId: string }>): Promise<Response> {
    // const userId = req.session.userId
    const userId = 'murilo'
    const customerIdParse = customerIdSchema.parse2(ctx.params.customerId)

    let body: unknown
    try {
      body = await ctx.request.json()
    } catch (err) {
      const error = ensureError(err)

      console.error(error)
      return ctx.responseStatus(500)
        .jsonResponse({ message: "Failed to process the request's body" })
    }

    const bodyParseResult = customerUpdatePayloadSchema.parse2(body)
    
    if (!customerIdParse.success)
      return ctx.responseStatus(400)
        .jsonResponse({
          message: ctx.params.customerId ? 'Invalid customerId in URL params' : 'Missing customerId in URL params',
          issues: customerIdParse.error.context
        })

    if (!bodyParseResult.success)
      return ctx.responseStatus(400)
        .jsonResponse({
          message: body ? 'Invalid Payload' : 'Request Body is required',
          issues: bodyParseResult.error.context
        })

    try {
      await deps.customerUpdate.execute({
        userId,
        customerId: customerIdParse.data,
        payload: bodyParseResult.data
      })

      return ctx.responseStatus(204).emptyResponse()
    } catch (e) {
      const error = ensureError(e)
      console.debug(error)

      if (error instanceof AlreadyExistsError)
        return ctx.responseStatus(422).jsonResponse(only(error, 'message'))
      if (error instanceof NotFoundError)
        return ctx.responseStatus(404).jsonResponse({ message: 'Resource Not Found' })

      console.error(error)
      return ctx.responseStatus(500).jsonResponse({ message: 'Internal Server Error' })
    }
  }

  async function deleteCustomer(ctx: RequestContext<{ customerId: string }>): Promise<Response> {
    // const userId = req.session.userId
    const userId = 'murilo'

    const [parseErr, customerId] = customerIdSchema.parse3(ctx.params.customerId)

    if (parseErr)
      return ctx.responseStatus(400)
        .jsonResponse({
          message: ctx.params.customerId ? 'Invalid customerId in URL params' : 'Missing customerId in URL params',
          issues: parseErr.context
        })

    const [deletionErr] = await deps.customerDeletion.execute({
      customerId: customerId!,
      userId
    })

    if (deletionErr) {
      console.debug(deletionErr)
      if (deletionErr instanceof NotFoundError)
        return ctx.responseStatus(404)
          .jsonResponse({ message: 'Resource Not Found' })
      
      console.error(deletionErr)
      return ctx.responseStatus(500)
        .jsonResponse({ message: "Internal Server Error" })
    }

    return ctx.responseStatus(204).emptyResponse()
  }

}
