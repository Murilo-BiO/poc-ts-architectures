import { customAlphabet } from 'nanoid'

export type CustomerIdGenerator = {
  generate(): string
}

export class NanoCustomerIdGenerator implements CustomerIdGenerator {
  private nanoid

  constructor() {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    this.nanoid = customAlphabet(alphabet, 10)
  }

  generate(): string {
    return this.nanoid()
  }
}

let a = new NanoCustomerIdGenerator()
console.log(Array.from(Array(3), a.generate.bind(a)))