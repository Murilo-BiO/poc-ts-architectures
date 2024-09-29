import { Customer } from "./entities"
import { customAlphabet } from 'nanoid'

export type CustomerIdGenerator = {
  generate(): Customer["id"]
}

export class NanoCustomerIdGenerator implements CustomerIdGenerator {
  private nanoid

  constructor() {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    this.nanoid = customAlphabet(alphabet, 10)
  }

  generate(): Customer["id"] {
    return this.nanoid()
  }
}
