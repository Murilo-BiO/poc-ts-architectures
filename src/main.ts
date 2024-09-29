import './env'
import { registerCustomerRoutes } from 'customer/customer-controller'
import { makeServer } from 'web/fastify-http-server'
import { CustomerCreationUsecase } from 'customer/usecases/create-customer'
import { InMemoryCustomerRepository } from 'customer/customer-repository'
import { NanoCustomerIdGenerator } from 'customer/customer-id-generator'
import { Customer } from 'customer/entities'
import { CustomerUpdateUsecase } from 'customer/usecases/update-customer'
import { registerAuthenticationRoutes } from 'authentication/authentication-controller'

const server = makeServer()

async function main() {
  const db: Customer[] = []
  const customerRepo = new InMemoryCustomerRepository(db)

  registerAuthenticationRoutes({ httpServer: server })
  registerCustomerRoutes({
    httpServer: server,
    customerCreation: new CustomerCreationUsecase({
      customerIdGenerator: new NanoCustomerIdGenerator(),
      customerRepo,
    }),
    customerUpdate: new CustomerUpdateUsecase({
      customerRepo,
    })
  })

  server.get('/db', (_, reply) => reply.send(db))

  await server.listen({
    host: process.env.HOST,
    port: Number(process.env.PORT)
  })
}

main().catch(console.error)
