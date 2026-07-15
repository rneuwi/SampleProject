import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema, ZodType, ZodTypeDef } from 'zod';
import { ApiError } from './ApiError';

// Validates req.body against a schema and replaces it with the parsed
// (and coerced/trimmed) result, so controllers can trust their input shape.
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(toApiError(result.error));
      return;
    }
    req.body = result.data;
    next();
  };
}

// Query strings can't be reassigned on Express's Request in a type-safe way,
// so query validation is a plain helper controllers call directly.
// Two generics (rather than ZodSchema<T>) because schemas with a .transform()/.pipe()
// step (e.g. comma-separated query values normalized into an array) have a parsed
// Output that differs from their raw Input — collapsing both to one T would infer
// the wrong side.
export function parseQuery<Output, Input = Output>(schema: ZodType<Output, ZodTypeDef, Input>, query: unknown): Output {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw toApiError(result.error);
  }
  return result.data;
}

export function parseIdParam(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest(`Invalid id parameter: ${raw}`);
  }
  return id;
}

function toApiError(error: ZodError): ApiError {
  const details = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
  return ApiError.badRequest('Request validation failed', details);
}
