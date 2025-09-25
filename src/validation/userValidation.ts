import Joi from 'joi';
import {
  UserSignupRequest, UserSigninRequest, UserUpdateRequest, HealthPlanRequest
} from '@/types/user.types';

export interface ValidationResult {
  error?: Joi.ValidationError | undefined;
  value: any;
}

export class UserValidation {
  /**
   * Validate user signup data
   */
  static validateSignup(userData: UserSignupRequest): ValidationResult {
    const schema = Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .messages({
          'string.empty': 'Please enter a first name',
          'string.min': 'First name should have a minimum length of 2 characters',
          'string.max': 'First name should have a maximum length of 50 characters',
          'any.required': 'First name is required',
        }),

      lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .messages({
          'string.empty': 'Please enter a last name',
          'string.min': 'Last name should have a minimum length of 2 characters',
          'string.max': 'Last name should have a maximum length of 50 characters',
          'any.required': 'Last name is required',
        }),

      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'co', 'uk', 'ng', 'io'] }
        })
        .required()
        .lowercase()
        .trim()
        .messages({
          'string.empty': 'Please enter your email address',
          'string.email': 'Please enter a valid email address',
          'any.required': 'Email address is required',
        }),

      password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .messages({
          'string.empty': 'Password is required',
          'string.min': 'Password should have a minimum length of 8 characters',
          'string.max': 'Password should have a maximum length of 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required',
        }),

      confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
          'string.empty': 'Please confirm your password',
          'any.only': 'Passwords do not match',
          'any.required': 'Password confirmation is required',
        }),
    }).options({ abortEarly: false });

    return schema.validate(userData);
  }

  /**
   * Validate user signin data
   */
  static validateSignin(userData: UserSigninRequest): ValidationResult {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
          'string.empty': 'Please enter your email address',
          'string.email': 'Please enter a valid email address',
          'any.required': 'Email address is required',
        }),

      password: Joi.string()
        .required()
        .messages({
          'string.empty': 'Password is required',
          'any.required': 'Password is required',
        }),
    }).options({ abortEarly: false });

    return schema.validate(userData);
  }

  /**
   * Validate user update data
   */
  static validateUpdate(userData: UserUpdateRequest): ValidationResult {
    const schema = Joi.object({
      BVN: Joi.string()
        .length(11)
        .pattern(/^\d{11}$/)
        .optional()
        .messages({
          'string.length': 'BVN must be exactly 11 digits',
          'string.pattern.base': 'BVN must contain only numbers',
        }),

      phoneNumber: Joi.string()
        .min(10)
        .max(15)
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          'string.min': 'Phone number must be at least 10 digits',
          'string.max': 'Phone number must be at most 15 digits',
          'string.pattern.base': 'Please enter a valid phone number',
        }),
    }).options({ abortEarly: false });

    return schema.validate(userData);
  }

  /**
   * Validate health plan data
   */
  static validateHealthPlan(planData: HealthPlanRequest): ValidationResult {
    const schema = Joi.object({
      healthPlan: Joi.string()
        .min(2)
        .max(100)
        .required()
        .trim()
        .messages({
          'string.empty': 'Please select a health plan',
          'string.min': 'Health plan name must be at least 2 characters',
          'string.max': 'Health plan name must be at most 100 characters',
          'any.required': 'Health plan is required',
        }),
    }).options({ abortEarly: false });

    return schema.validate(planData);
  }

  /**
   * Validate email for verification
   */
  static validateEmail(email: string): ValidationResult {
    const schema = Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Please enter your email address',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email address is required',
      });

    return schema.validate(email);
  }
}

// Legacy function for backward compatibility
export const userValidation = (
  userData: UserSignupRequest
): ValidationResult => UserValidation.validateSignup(userData);

export default userValidation;
