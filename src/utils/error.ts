import { none, Option, some } from "./option"

export function ensureError(value: unknown): BaseError {
  if (value instanceof Error)
    return value instanceof BaseError
      ? value
      : new BaseError(value.message, { cause: value })

  let stringified = "[Unable to stringify the thrown value]"
  try {
    stringified = JSON.stringify(value)
  } catch {}

  return new BaseError(`This value was thrown as is, not through an Error.`, { context: stringified })
}

type Jsonable = string | number | boolean | null | undefined | readonly Jsonable[] | { readonly [key: string]: Jsonable } | { toJSON(): Jsonable }

export class BaseError<T extends Jsonable = Jsonable> extends Error {
  public readonly context: Jsonable

  constructor(message: string, options: { cause?: unknown, context?: T } = {}) {
    const { cause, context } = options

    super(message, { cause })
    this.name = this.constructor.name

    this.context = context
  }
}

// Common errors
export class AlreadyExistsError extends BaseError {}
export class NotFoundError extends BaseError {}
export class SearchFailedError extends BaseError {}
export class ParsingError extends BaseError {}
export class UnexpectedCollisionError extends BaseError {}
export class ActionFailedError extends BaseError {}
