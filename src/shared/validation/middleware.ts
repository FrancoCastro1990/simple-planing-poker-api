import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateBody = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: result.error.errors.map((err: any) => ({
              field: err.path?.join('.') || 'unknown',
              message: err.message,
            })),
          },
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request body',
          code: 'VALIDATION_ERROR',
        },
      });
    }
  };
};

export const validateParams = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: result.error.errors.map((err: any) => ({
              field: err.path?.join('.') || 'unknown',
              message: err.message,
            })),
          },
        });
      }
      req.params = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request parameters',
          code: 'VALIDATION_ERROR',
        },
      });
    }
  };
};

export const validateSocketData = (schema: z.ZodSchema<any>, data: any): { success: boolean; data?: any; error?: string } => {
  try {
    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: result.error.errors.map((err: any) => err.message).join(', '),
      };
    }
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Validation failed',
    };
  }
};