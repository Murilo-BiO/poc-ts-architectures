import { BaseError } from "./error"
import { none, Option, some } from "./option"

// type Ok<T> = {
//   success: true
//   data: T
// }

// type Err<E extends Error = Error> = {
//   success: false
//   error: E
// }

// export type Result<T, E extends Error = Error> = Ok<T> | Err<E>

class Err<E extends BaseError = BaseError, T extends any = any> {
  constructor(private readonly error: E) { }

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<E, T> {
    return true
  }

  unwrap(): never {
    throw new BaseError("Panic! Tried to unwrap an Err value.", { cause: this.error })
  }

  unwrapErr(): E {
    return this.error
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  ok(): Option<T> {
    return none()
  }

  andThen<U>(op: (v: T) => Result<U, E>): Result<U, E> {
    return (this as unknown) as Result<U, E>
  }

  async andThenAsync<U>(op: (v: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return (this as unknown) as Result<U, E>
  }

  map<U>(op: (v: T) => U): Result<U, E> {
    return (this as unknown) as Result<U, E>
  }

  async mapAsync<U>(op: (v: T) => Promise<U>): Promise<Result<U, E>> {
    return (this as unknown) as Result<U, E>
  }

  mapErr<F extends BaseError = BaseError>(op: (e: E) => F): Result<T, F> {
    return err(op(this.unwrapErr()))
  }
}

class Ok<T, E extends BaseError = BaseError> {
  constructor(private readonly data: T) { }

  isOk(): this is Ok<T> {
    return true
  }

  isErr(): this is Err<E> {
    return false
  }

  unwrap(): T {
    return this.data
  }

  unwrapErr(): never {
    throw new BaseError("Panic! Tried to unwrapErr an Ok value.")
  }

  unwrapOr(defaultValue: T): T {
    return this.unwrap()
  }

  ok(): Option<T> {
    return some(this.unwrap())
  }

  andThen<U>(op: (v: T) => Result<U, E>): Result<U, E> {
    return op(this.unwrap())
  }

  async andThenAsync<U>(op: (v: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return await op(this.unwrap())
  }

  map<U>(op: (v: T) => U): Result<U, E> {
    return ok(op(this.unwrap()))
  }

  async mapAsync<U>(op: (v: T) => Promise<U>): Promise<Result<U, E>> {
    return ok(await Promise.resolve(op(this.unwrap())))
  }

  mapErr<F extends BaseError = BaseError>(op: (e: E) => F): Result<T, F> {
    return (this as unknown) as Result<T, F>
  }
}

export type Result<T, E extends BaseError = BaseError> = Ok<T, E> | Err<E, T>

export function ok<T, E extends BaseError>(data: T): Result<T, E> {
  return new Ok(data)
}

export function err<T, E extends BaseError>(error: E): Result<T, E> {
  return new Err(error)
}
