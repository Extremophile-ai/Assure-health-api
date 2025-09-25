import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import UserServices from '@/services/User/User';
import { UserValidation } from '@/validation/userValidation';
import JWTHelper from '@/utils/jwt/jwt';
import EmailService from '@/utils/sendgrid';
import {
  AuthenticatedRequest,
  ApiResponse,
  AuthenticatedControllerFunction,
  ControllerFunction
} from '@/types/common.types';
import {
  UserSignupRequest,
  UserSigninRequest,
  UserUpdateRequest,
  HealthPlanRequest
} from '@/types/user.types';

export default class UserController {
  /**
   * User signup controller
   */
  static userSignup: ControllerFunction = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const requestData: UserSignupRequest = req.body;
      const {
        email, firstName, lastName, password, confirmPassword
      } = requestData;

      // Validate input data
      const { error } = UserValidation.validateSignup(requestData);
      if (error) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: error.details.map((detail) => detail.message).join(', '),
        } as ApiResponse);
      }

      // Check if passwords match (additional validation)
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: 'Passwords do not match',
        } as ApiResponse);
      }

      // Normalize data
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedFirstName = firstName.toLowerCase().trim();
      const normalizedLastName = lastName.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await UserServices.findUser(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          status: 409,
          error: 'An account with this email already exists. Please login or use a different email.',
        } as ApiResponse);
      }

      // Hash password with modern bcrypt settings
      const saltRounds = 12; // Increased from 10 for better security
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const signUpDetails = {
        email: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        password: hashedPassword,
      };

      const createdUser = await UserServices.signUpUser(signUpDetails);

      // Send verification email
      await EmailService.verifyUser(normalizedEmail, firstName);

      // Generate JWT token
      const token = await JWTHelper.generateToken({ createUser: createdUser });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        token,
        data: {
          user: {
            id: createdUser.id,
            email: createdUser.email,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            verified: createdUser.verified,
            role: createdUser.role,
          }
        }
      } as ApiResponse);
    } catch (error) {
      console.error('User signup error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred while creating your account. Please try again.',
      } as ApiResponse);
    }
  };

  /**
   * Email verification controller
   */
  static verifyUser: ControllerFunction = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: 'Email parameter is required',
        } as ApiResponse);
      }

      // Validate email format
      const { error } = UserValidation.validateEmail(email);
      if (error) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: 'Invalid email format',
        } as ApiResponse);
      }

      const result = await UserServices.verifyUser(email);

      if (result[0] === 0) {
        return res.status(404).json({
          success: false,
          status: 404,
          error: 'User not found or already verified',
        } as ApiResponse);
      }

      return res.status(200).json({
        success: true,
        message: 'Email verification successful! You can now login to your account.',
      } as ApiResponse);
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred during email verification.',
      } as ApiResponse);
    }
  };

  /**
   * User signin controller
   */
  static userSignin: ControllerFunction = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const requestData: UserSigninRequest = req.body;
      const { email, password } = requestData;

      // Validate input
      const { error } = UserValidation.validateSignin(requestData);
      if (error) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: error.details.map((detail) => detail.message).join(', '),
        } as ApiResponse);
      }

      // Find user
      const user = await UserServices.findUser(email.toLowerCase().trim());
      if (!user) {
        return res.status(404).json({
          success: false,
          status: 404,
          error: 'Invalid email or password',
        } as ApiResponse);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(404).json({
          success: false,
          status: 404,
          error: 'Invalid email or password',
        } as ApiResponse);
      }

      // Check if user is verified
      if (!user.verified) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Please verify your email address before logging in',
        } as ApiResponse);
      }

      // Generate token
      const token = await JWTHelper.generateToken({ user });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            verified: user.verified,
            role: user.role,
          }
        }
      } as ApiResponse);
    } catch (error) {
      console.error('User signin error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred during login. Please try again.',
      } as ApiResponse);
    }
  };

  /**
   * Update user details controller
   */
  static update: AuthenticatedControllerFunction = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.decoded?.user?.id) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Authentication required',
        } as ApiResponse);
      }

      const { id } = req.decoded.user;
      const updateData: UserUpdateRequest = req.body;

      // Validate input
      const { error } = UserValidation.validateUpdate(updateData);
      if (error) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: error.details.map((detail) => detail.message).join(', '),
        } as ApiResponse);
      }

      // Convert string numbers to bigint
      const { BVN, phoneNumber } = updateData;
      if (!BVN || !phoneNumber) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: 'Both BVN and phone number are required',
        } as ApiResponse);
      }

      const bvnBigInt = BigInt(BVN);
      const phoneNumberBigInt = BigInt(phoneNumber);

      const result = await UserServices.updateDetails(id, bvnBigInt, phoneNumberBigInt);

      if (result[0] === 0) {
        return res.status(404).json({
          success: false,
          status: 404,
          error: 'User not found',
        } as ApiResponse);
      }

      return res.status(200).json({
        success: true,
        message: 'User details updated successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred while updating user details.',
      } as ApiResponse);
    }
  };

  /**
   * Get all users controller (Admin only)
   */
  static getAllUsers: ControllerFunction = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const users = await UserServices.getAllUser();

      // Remove sensitive information
      const safeUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,
        role: user.role,
        healthPlan: user.healthPlan,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return res.status(200).json({
        success: true,
        message: 'All users retrieved successfully',
        count: users.length,
        data: safeUsers,
      } as ApiResponse<typeof safeUsers>);
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred while retrieving users.',
      } as ApiResponse);
    }
  };

  /**
   * Add health plan controller
   */
  static addHealthPlan: AuthenticatedControllerFunction = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.decoded?.user?.id) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Authentication required',
        } as ApiResponse);
      }

      const { id } = req.decoded.user;
      const planData: HealthPlanRequest = req.body;

      // Validate input
      const { error } = UserValidation.validateHealthPlan(planData);
      if (error) {
        return res.status(400).json({
          success: false,
          status: 400,
          error: error.details.map((detail) => detail.message).join(', '),
        } as ApiResponse);
      }

      const result = await UserServices.chooseHealthPlan(id, planData.healthPlan);

      if (result[0] === 0) {
        return res.status(404).json({
          success: false,
          status: 404,
          error: 'User not found',
        } as ApiResponse);
      }

      return res.status(200).json({
        success: true,
        message: 'Health plan added successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Add health plan error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred while adding the health plan.',
      } as ApiResponse);
    }
  };

  /**
   * Delete user account controller
   */
  static removeUser: AuthenticatedControllerFunction = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.decoded?.user?.id) {
        return res.status(401).json({
          success: false,
          status: 401,
          error: 'Authentication required',
        } as ApiResponse);
      }

      const { id } = req.decoded.user;
      const result = await UserServices.deleteUser(id);

      if (result === 0) {
        return res.status(404).json({
          success: false,
          status: 404,
          error: 'User not found',
        } as ApiResponse);
      }

      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        error: 'An error occurred while deleting the account.',
      } as ApiResponse);
    }
  };
}
