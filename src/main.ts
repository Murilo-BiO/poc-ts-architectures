import './env'
import { registerCustomerRoutes } from 'customer/controllers/customer-http-controller'
import { FastifyHttpServer } from 'web/fastify-http-server'
import { CustomerCreationUsecase } from 'customer/usecases/create-customer'
import { InMemoryCustomerRepository } from 'customer/customer-repository'
import { NanoCustomerIdGenerator } from 'customer/services/customer-id-generator'
import { Customer } from 'customer/customer-entities'
import { CustomerUpdateUsecase } from 'customer/usecases/update-customer'
import { registerAuthenticationRoutes } from 'authentication/controllers/authentication-http-controller'
import { CustomerDeletionUsecase } from 'customer/usecases/delete-customer'

const httpServer = new FastifyHttpServer()

async function main() {
  const db: Customer[] = []
  const customerRepo = new InMemoryCustomerRepository(db)

  registerAuthenticationRoutes({ httpServer })
  registerCustomerRoutes({
    httpServer,
    customerCreation: new CustomerCreationUsecase({
      customerIdGenerator: new NanoCustomerIdGenerator(),
      customerRepo,
    }),
    customerUpdate: new CustomerUpdateUsecase({
      customerRepo,
    }),
    customerDeletion: new CustomerDeletionUsecase({
      customerRepo,
    })
  })

  httpServer.addEndpoint('GET', '/db', (ctx) => ctx.jsonResponse(db))

  await httpServer.listen({
    host: process.env.HOST,
    port: Number(process.env.PORT)
  })
}

main().catch(console.error)
