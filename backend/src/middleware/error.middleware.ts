import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Try to parse validation errors
    try {
      errors = JSON.parse(message);
      message = 'Validation failed';
    } catch {
      // Not a JSON error message, keep as is
    }
  }

  // MongoDB duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values((err as any).errors).map((error: any) => ({
      field: error.path,
      message: error.message
    }));
  }

  // Zod validation error (if not already caught)
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = (err as any).errors.map((error: any) => ({
      field: error.path.join('.'),
      message: error.message
    }));
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode
    });
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};