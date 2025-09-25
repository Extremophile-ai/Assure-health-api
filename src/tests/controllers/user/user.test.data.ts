import { UserSignupRequest, UserSigninRequest, UserUpdateRequest } from '@/types/user.types';

export const validUser: UserSignupRequest = {
  email: 'testuser@assurehealth.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!'
};

export const duplicateEmailUser: UserSignupRequest = {
  email: 'testuser@assurehealth.com', // Same email as validUser
  firstName: 'Duplicate',
  lastName: 'User',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!'
};

export const unmatchedPasswordUser: UserSignupRequest = {
  email: 'unmatched@assurehealth.com',
  firstName: 'Unmatched',
  lastName: 'Password',
  password: 'TestPassword123!',
  confirmPassword: 'DifferentPassword123!'
};

export const validLoginUser: UserSigninRequest = {
  email: 'testuser@assurehealth.com',
  password: 'TestPassword123!'
};

export const invalidLoginUser: UserSigninRequest = {
  email: 'nonexistent@assurehealth.com',
  password: 'WrongPassword123!'
};

export const updateUserDetails: UserUpdateRequest = {
  BVN: BigInt('12345678901'),
  phoneNumber: BigInt('2347034568886')
};

export const healthPlanData = {
  healthPlan: 'Premium Health Plan'
};

// Invalid data for validation testing
export const invalidUserData = {
  invalidEmail: {
    email: 'invalid-email',
    firstName: 'Test',
    lastName: 'User', 
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  },
  shortPassword: {
    email: 'shortpass@assurehealth.com',
    firstName: 'Short',
    lastName: 'Password',
    password: '123',
    confirmPassword: '123'
  },
  shortName: {
    email: 'shortname@assurehealth.com',
    firstName: 'A', // Too short
    lastName: 'B',  // Too short
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  }
};