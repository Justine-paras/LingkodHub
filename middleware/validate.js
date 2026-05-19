/**
 * [KEYWORD: #VALIDATION_GUARD]
 * PURPOSE: Validates incoming request body fields before hitting database routers.
 * HOW IT WORKS: It acts as a Higher-Order Function. It receives a Zod schema, and returns
 * an Express middleware closure. If validation fails, it stops execution and returns 400 Bad Request
 * with flattened field error details. If successful, it replaces req.body with the sanitized and typed data.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: "Validation failed", issues: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}

