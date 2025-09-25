import { UserRole } from './common.types';

export interface UserAttributes {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  verified: boolean;
  phoneNumber?: bigint | null;
  BVN?: bigint | null;
  healthPlan?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  verified?: boolean;
  phoneNumber?: bigint | null;
  BVN?: bigint | null;
  healthPlan?: string | null;
  role?: UserRole;
}

export interface UserSignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface UserSigninRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  BVN?: bigint;
  phoneNumber?: bigint;
}

export interface HealthPlanRequest {
  healthPlan: string;
}

export interface UserValidationSchema {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface JWTPayload {
  user?: UserAttributes;
  createUser?: UserAttributes;
  iat?: number;
  exp?: number;
}

export interface UserServiceMethods {
  signUpUser: (signupDetails: UserCreationAttributes) => Promise<UserAttributes>;
  findUser: (email: string) => Promise<UserAttributes | null>;
  getById: (id: string) => Promise<UserAttributes | null>;
  getAllUser: () => Promise<UserAttributes[]>;
  updateDetails: (
    id: string,
    BVN: bigint,
    phoneNumber: bigint
  ) => Promise<[number, UserAttributes[]]>;
  chooseHealthPlan: (
    id: string,
    healthPlan: string
  ) => Promise<[number, UserAttributes[]]>;
  deleteUser: (id: string) => Promise<number>;
  verifyUser: (email: string) => Promise<[number, UserAttributes[]]>;
}
