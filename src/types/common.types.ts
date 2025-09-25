import { Request, Response } from 'express';

export type UserRole = 'Super Admin' | 'Admin' | 'User';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
  count?: number;
}

export interface AuthenticatedRequest extends Request {
  decoded?: {
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
    createUser?: any;
  };
}

export interface DatabaseConfig {
  url?: string;
  database?: string;
  username?: string;
  password?: string;
  dialect: 'postgres';
  host?: string;
  port?: number;
}

export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: string;
  JWT_KEY: string;
  SENDGRID_API_KEY: string;
  SENDGRID_EMAIL: string;
  DEV_DATABASE_URL?: string;
  TEST_DATABASE_URL?: string;
  DATABASE_URL?: string;
}

export type ControllerFunction = (
  req: Request,
  res: Response
) => Promise<Response | void>;
export type AuthenticatedControllerFunction = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<Response | void>;
