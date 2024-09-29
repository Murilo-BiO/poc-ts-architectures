import { z } from 'zod';
import { err, ok, Result } from './result';
import { ParsingError } from './error';

type SchemaParseIssue = {
  path: (string | number)[]
  message: string
}

export class Schema<T> {
  constructor(private readonly zodSchema: z.Schema<T>) { }

  public static from<Output>(zodSchema: z.Schema<Output>) {
    return new Schema(zodSchema)
  }

  public parse(data: unknown): Result<T, ParsingError> {
    const parseResult = this.zodSchema.safeParse(data)
    return parseResult.success
      ? ok(parseResult.data)
      : err(this.adaptError(parseResult.error))
  }

  public parse2(data: unknown): { success: true, data: T } | { success: false, error: ParsingError } {
    const parseResult = this.zodSchema.safeParse(data)
    return parseResult.success
      ? { success: true, data: parseResult.data }
      : { success: false, error: this.adaptError(parseResult.error) }
  }

  private adaptError<T>(error: z.ZodError<T>): ParsingError {
    const issues = error.issues.map(({
      path,
      message,
    }) => ({
      path,
      message,
    }))

    return new ParsingError("Failed to parse.", { cause: error, context: issues })
  }
}
