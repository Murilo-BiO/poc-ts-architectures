import { err, ok, Result } from "utils/result"
import { Customer } from "./entities"
import { none, Option, some } from "utils/option"
import { ActionFailedError, BaseError, NotFoundError } from "utils/error"
import { only } from "utils/only"

export type CustomerRepository = {
  findByName(name: string): Promise<Result<Option<Customer>>>
  findById(id: Customer["id"]): Promise<Result<Option<Customer>>>
  findBatchByIds(ids: Customer['id'][]): Promise<Result<Option<Customer>[]>>
  save(customer: Customer): Promise<Result<void>>

  findById2(id: Customer['id']): Promise<[Customer?]>
  findByName2(name: string): Promise<[Customer?]>
  save2(customer: Customer): Promise<void>
}

export class InMemoryCustomerRepository implements CustomerRepository {
  constructor(private readonly db: Customer[], private options: { errorToThrow?: BaseError } = {}) {}

  findBy<K extends keyof Customer>(field: K, value: Customer[K]): Option<Customer> {
    const found = this.db.find(c => c[field] === value)

    if (!found)
      return none()

    return some(found)
  }

  async findByName(name: string): Promise<Result<Option<Customer>>> {
    if (this.options.errorToThrow)
      return err(this.options.errorToThrow!)

    return ok(this.findBy('name', name))
  }

  async findById(id: Customer["id"]): Promise<Result<Option<Customer>>> {
    if (this.options.errorToThrow)
      return err(this.options.errorToThrow!)

    return ok(this.findBy('id', id))
  }

  async findBatchByIds(ids: Customer["id"][]): Promise<Result<Option<Customer>[]>> {
    if (this.options.errorToThrow)
      return err(this.options.errorToThrow!)

    return ok(ids.map(id => this.findBy('id', id)))
  }

  async save(customer: Customer): Promise<Result<void>> {
    if (this.options.errorToThrow)
      return err(this.options.errorToThrow!)

    const idx = this.db.findIndex(c => c.id === customer.id)
    if (idx < 0) {
      this.db.push(customer)
      return ok(void 0)
    }

    this.db[idx] = {
      ...this.db[idx],
      ...customer
    }

    return ok(void 0)
  }

  async findById2(id: Customer["id"]): Promise<[Customer?]> {
    if (this.options.errorToThrow)
      throw this.options.errorToThrow

    return [this.db.find(c => c.id === id)]
  }

  async save2(customer: Customer): Promise<void> {
    if (this.options.errorToThrow)
      throw this.options.errorToThrow

    const idx = this.db.findIndex(c => c.id === customer.id)
    if (idx < 0)
      this.db.push(customer)
    else
      this.db[idx] = customer
  }

  async findByName2(name: string): Promise<[Customer?]> {
    if (this.options.errorToThrow)
      throw this.options.errorToThrow

    return [this.db.find(c => c.name === name)]
  }
}
