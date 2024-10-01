import { CustomerRepository } from "customer/customer-repository";
import { Customer } from "customer/entities";
import { User } from "user/entities";
import { ActionFailedError, NotFoundError, SearchFailedError } from "utils/error";
import { only } from "utils/only";
import { Prettify } from "utils/type";

type DTO = Prettify<{
  userId: User['id']
  customerId: Customer['id']
}>

type CustomerDeletionError =
  | NotFoundError
  | SearchFailedError
  | ActionFailedError

export class CustomerDeletionUsecase {
  constructor(private readonly deps: {
    customerRepo: Pick<CustomerRepository, 'save3' | 'findById3'>
  }) {}

  async execute(dto: DTO): Promise<[CustomerDeletionError?]> {
    const [findErr, customer] = await this.deps.customerRepo.findById3(dto.customerId)
    if (findErr)
      return [new SearchFailedError(
        'Failed to search if customer exists',
        { cause: findErr, context: dto }
      )]

    if (!customer)
      return [new NotFoundError(
        'Customer Not Found',
        { context: dto }
      )]

    if (customer.deleted) // Nothing to do...
      return []

    const [saveErr] = await this.deps.customerRepo.save3({
      ...customer,
      deleted: true,
      updatedAt: new Date(),
      updatedBy: dto.userId,
    })

    if (saveErr)
      return [new ActionFailedError(
        'Could Not Delete Customer',
        { cause: saveErr, context: dto }
      )]

    return []
  }
}
