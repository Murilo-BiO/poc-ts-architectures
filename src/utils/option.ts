import { BaseError } from "./error";
import { err, ok, Result } from "./result";

// type Some<T> = {
//   some: true,
//   data: T
// }

// type None = {
//   some: false
// }

// export type Option<T> = Some<T> | None

// export function some<T>(data: T): Some<T> {
//   return {
//     some: true,
//     data
//   }
// }

// export function none(): None {
//   return {
//     some: false
//   }
// }

class Some<T> {
  constructor(private readonly data: T) {}

  isSome(): this is Some<T> {
    return true
  }

  isNone(): this is None<T> {
    return false
  }

  unwrap(): T {
    return this.data
  }

  unwrapOr(defaultValue: T): T {
    return this.unwrap()
  }

  ok_or<E extends BaseError = BaseError>(error: E): Result<T, E> {
    return ok(this.unwrap())
  }

  async andThenAsync<U>(op: (v: T) => Promise<Option<U>>): Promise<Option<U>> {
    return await op(this.unwrap())    
  }

  map<U>(op: (v: T) => U): Option<U> {
    return some(op(this.unwrap()))
  }

  async mapAsync<U>(op: (v: T) => Promise<U>): Promise<Option<U>> {
    return some(await Promise.resolve(op(this.unwrap())))
  }
}

class None<T> {
  isSome(): this is Some<T> {
    return false
  }

  isNone(): this is None<T> {
    return true
  }

  unwrap(): never {
    throw new BaseError("Panic! Tried to unwrap a None value.");
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  ok_or<E extends BaseError = BaseError>(error: E): Result<T, E> {
    return err(error)
  }

  async andThenAsync<U>(op: (v: T) => Promise<Option<U>>): Promise<Option<U>> {
    return none() 
  }

  map<U>(op: (v: T) => U): Option<U> {
    return none()
  }

  async mapAsync<U>(op: (v: T) => Promise<U>): Promise<Option<U>> {
    return none()
  }
}

export type Option<T> = Some<T> | None<T>

export function some<T>(data: T): Option<T> {
  return new Some(data)
}

export function none<T>(): Option<T> {
  return new None<T>()
}

export namespace Option {
  export function isSome<T>(option: Option<T>): option is Some<T> {
    return option.isSome()
  }
  
  export function isNone<T>(option: Option<T>): option is None<T> {
    return option.isNone()
  }

  export function wrap<T>(value: T | undefined): Option<T> {
    return typeof value === 'undefined' ? none() : some(value)
  }
}
