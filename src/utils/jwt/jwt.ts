import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { TokenPayload, JWTConfig } from '@/types/auth.types';

dotenv.config();

const secretKey = process.env.JWT_KEY!;

if (!secretKey) {
  throw new Error('JWT_KEY environment variable is required');
}

export default class JWTHelper {
  /**
   * Generate a JWT token with the provided payload
   * @param payload - The details to be signed
   * @param secret - The JWT secret key (optional, defaults to env secret)
   * @returns Promise<string> The JWT signed token
   */
  static async generateToken(
    payload: TokenPayload, 
    secret: string = secretKey
  ): Promise<string> {
    try {
      const token = jwt.sign(payload, secret, { expiresIn: '1d' });
      return token;
    } catch (error) {
      throw new Error(`Failed to generate token: ${error}`);
    }
  }

  /**
   * Generate a password reset token
   * @param payload - The details to be signed
   * @param secret - The JWT secret key
   * @returns Promise<string> The JWT signed token
   */
  static async generatePasswordToken(
    payload: TokenPayload, 
    secret: string
  ): Promise<string> {
    try {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      return token;
    } catch (error) {
      throw new Error(`Failed to generate password token: ${error}`);
    }
  }

  /**
   * Verify a JWT token
   * @param token - The token to verify
   * @param secret - The JWT secret key
   * @returns Promise<object> The decoded token payload
   */
  static async verifyToken(
    token: string, 
    secret: string
  ): Promise<any> {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      throw new Error(`Token verification failed: ${error}`);
    }
  }

  /**
   * Decode a JWT token without verification
   * @param token - The token to decode
   * @returns object | null The decoded token payload or null if invalid
   */
  static decodeToken(token: string): any | null {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}