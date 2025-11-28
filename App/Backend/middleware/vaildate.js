import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Parse and validate the request
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // If validation is successful, move to the next middleware (or controller)
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      err,
    });
  }
};