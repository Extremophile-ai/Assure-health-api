import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types/common.types';
import { DecodedToken } from '@/types/auth.types';

dotenv.config();

const JWT_SECRET = process.env.JWT_KEY!;

if (!JWT_SECRET) {
  throw new Error('JWT_KEY environment variable is required');
}

export default class Authentication {
  /**
   * Middleware to authenticate JWT tokens
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static async authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Authorization header is missing. Please provide a valid token.',
        });
      }

      if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Invalid authorization format. Use Bearer <token>',
        });
      }

      const token = authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Token is missing. Please provide a valid token.',
        });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.decoded = decoded;
        return next();
      } catch (jwtError) {
        let errorMessage = 'Invalid token.';

        if (jwtError instanceof jwt.TokenExpiredError) {
          errorMessage = 'Session expired. Please login again.';
        } else if (jwtError instanceof jwt.JsonWebTokenError) {
          errorMessage = 'Invalid token format.';
        } else if (jwtError instanceof jwt.NotBeforeError) {
          errorMessage = 'Token not yet valid.';
        }

        return res.status(410).json({
          success: false,
          status: 410,
          error: errorMessage,
        });
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'Internal server error during authentication.',
      });
    }
  }

  /**
   * Optional authentication middleware - doesn't fail if no token provided
   */
  static async optionalAuthenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorization } = req.headers;

      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split(' ')[1];

        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            req.decoded = decoded;
          } catch (jwtError) {
            // Don't fail, just continue without decoded token
            console.warn('Optional authentication failed:', jwtError);
          }
        }
      }

      next();
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      next();
    }
  }

  /**
   * Role-based authorization middleware
   */
  static authorize(allowedRoles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
      if (!req.decoded?.user) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Authentication required.',
        });
      }

      const userRole = req.decoded.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          status: 403,
          error: 'Insufficient permissions to access this resource.',
        });
      }

      return next();
    };
  }
}
