import { CustomerRepository } from "customer/customer-repository";
import { Customer, CustomerUpdatePayload } from "customer/entities";
import { User } from "user/entities";
import { ActionFailedError, AlreadyExistsError, ensureError, NotFoundError, SearchFailedError } from "utils/error";
import { only } from "utils/only";

type DTO = {
  userId: User['id']
  customerId: Customer['id']
  payload: CustomerUpdatePayload
}

export class CustomerUpdateUsecase {
  constructor(private readonly deps: {
    customerRepo: Pick<CustomerRepository, 'findById2' | 'save2' | 'findByName2'>
  }) {}

  async execute(dto: DTO): Promise<void> {
    let customer: Customer | undefined
    try {
      [customer] = await this.deps.customerRepo.findById2(dto.customerId)
    } catch (e) {
      const error = ensureError(e)
      throw new SearchFailedError(
        'Search failed while searching customer',
        { cause: error, context: only(dto, ['userId', 'customerId']) }
      )
    }

    if (!customer)
      throw new NotFoundError(
        'Customer not Found',
        { context: only(dto, ['userId', 'customerId']) }
      )

    if (dto.payload.name) {
      let otherCustomer: Customer | undefined
      try {
        [otherCustomer] = await this.deps.customerRepo.findByName2(dto.payload.name)
      } catch (e) {
        const error = ensureError(e)
        throw new SearchFailedError(
          'Search failed while searching if new customer name is available',
          { cause: error, context: only(dto, 'userId') }
        )
      }

      if (otherCustomer)
        throw new AlreadyExistsError(
          'Could not update customer. New name is already in use.',
          {
            context: {
              ...only(dto, ['userId', 'customerId']),
              otherCustomer: otherCustomer.id,
            }
          }
        )
    }

    try {
      await this.deps.customerRepo.save2({
        ...customer,
        ...dto.payload,
        updatedBy: dto.userId,
        updatedAt: new Date(),
      })
    } catch (e) {
      const error = ensureError(e)
      throw new ActionFailedError(
        'Customer Update Failed',
        { cause: error, context: only(dto, ['userId', 'customerId']) }
      )
    }
  }
}
