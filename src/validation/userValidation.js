import Joi from 'joi';

const userValidation = (User) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3)
      .max(255)
      .empty()
      .messages({
        'string.empty': 'Please, enter a first name',
        'string.min': 'username should have a minimum length of 3 and a maximum length of 255',
      }),
    lastName: Joi.string().min(3)
      .max(255)
      .empty()
      .messages({
        'string.empty': 'Please, enter a last name',
        'string.min': 'username should have a minimum length of 3 and a maximum length of 255',
      }),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'uk', 'co'] } }).min(5)
      .max(100)
      .empty()
      .messages({
        'string.empty': 'Please enter your email address',
        'string.email': 'Please enter a valid email',
      }),
    password: Joi.string().empty().min(5)
      .max(1024)
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .messages({
        'string.empty': 'Sorry, password is required',
        'string.pattern.base': 'password must contain only alphanumeric characters.',
        'string.min': 'password should have a minimum length of 5',
      }),
    confirmPassword: Joi.string().empty().min(5)
      .max(1024)
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .messages({
        'string.empty': 'Sorry, password is required',
        'string.pattern.base': 'password must contain only alphanumeric characters.',
        'string.min': 'password should have a minimum length of 5',
      }),
  }).options({ abortEarly: false });
  return schema.validate(User);
};

export default userValidation;
