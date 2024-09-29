import { Customer, CustomerCreationPayload } from "customer/entities";
import { CustomerRepository } from "../customer-repository";
import { err, ok, Result } from "utils/result";
import { Option } from "utils/option";
import { CustomerIdGenerator } from "../customer-id-generator";
import { ActionFailedError, AlreadyExistsError, SearchFailedError, UnexpectedCollisionError } from "utils/error";
import { only } from "utils/only";
import { User } from "user/entities";

type CustomerCreationError =
  | SearchFailedError
  | AlreadyExistsError
  | UnexpectedCollisionError
  | ActionFailedError

export class CustomerCreationUsecase {
  constructor(private readonly deps: {
    customerIdGenerator: CustomerIdGenerator,
    customerRepo: Pick<CustomerRepository, 'findByName' | 'findBatchByIds' | 'save'>
  }) {}

  async execute(userId: User['id'], dto: CustomerCreationPayload): Promise<Result<Customer['id'], CustomerCreationError>> {
    const existsResult = await this.deps.customerRepo.findByName(dto.name)
    if (existsResult.isErr())
      return err(new SearchFailedError(
        'Failed to search customer',
        { cause: existsResult.unwrapErr() }
      ))

    const existent = existsResult.unwrap()
    if (existent.isSome())
      return err(new AlreadyExistsError(
        'Customer already exists',
        { context: only(existent.unwrap(), 'id') }
      ))

    const possibleIds = Array.from(Array(3), _ => this.deps.customerIdGenerator.generate())
    const verifiedIds = await this.deps.customerRepo.findBatchByIds(possibleIds)
    if (verifiedIds.isErr())
      return err(new SearchFailedError(
        'Failed to search if generated customerId is already in use',
        { cause: verifiedIds.unwrapErr() }
      ))

    const idx = verifiedIds
      .unwrap()
      .findIndex(Option.isNone)

    if (idx < 0)
      return err(new UnexpectedCollisionError(
        "Failed to generate new unique customerId.",
        { context: { attemptsThatCollided: possibleIds } }
      ))

    const customerId = possibleIds[idx]
    const today = new Date()
    const creationResult = await this.deps.customerRepo.save({
      id: customerId,
      name: dto.name,
      creationDate: today,
      createdBy: userId,
      updatedAt: today,
      updatedBy: userId,
    })

    if (creationResult.isErr())
      return err(new ActionFailedError(
        'Repository failed to create customer.',
        { cause: creationResult.unwrapErr() }
      ))

    return ok(customerId)
  }
}
