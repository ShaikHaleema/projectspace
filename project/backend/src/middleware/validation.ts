import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
    }
    next();
  };
};

export const validateRegister = validateRequest(
  Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
  })
);

export const validateLogin = validateRequest(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

export const validateProduct = validateRequest(
  Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().required(),
    originalPrice: Joi.number().positive().optional(),
    image: Joi.string().uri().required(),
    category: Joi.string().required(),
    description: Joi.string().min(10).max(1000).required(),
    stock: Joi.number().integer().min(0).required(),
    specifications: Joi.object().optional(),
  })
);