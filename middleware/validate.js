/**
 * Validation middleware factory.
 * Parses req.body through the given Zod schema.
 * On failure returns 400 with field-level error details.
 * On success, replaces req.body with the parsed (coerced) data.
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
