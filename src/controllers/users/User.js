import bcrypt from 'bcrypt';
import userServices from '../../services/User/User';
import userValidation from '../../validation/userValidation';
import JWTHelper from '../../Utility/jwt/jwt';
import sendGrid from '../../Utility/sendgrid';

const {
  chooseHealthPlan, updateDetails, findUser, signUpUser, deleteUser, verifyUser, getAllUser
} = userServices;

const { generateToken } = JWTHelper;

export default class UserController {
  static async userSignup(req, res) {
    try {
      const {
        email, firstName, lastName, password, confirmPassword
      } = req.body;
      const { error } = userValidation({
        email, firstName, lastName, password, confirmPassword
      });
      if (error) {
        return res.status(400).json({ status: 400, error: error.message });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 400,
          error: 'Passwords do not match',
        });
      }
      const Email = email.toLowerCase();
      const firstname = firstName.toLowerCase();
      const lastname = lastName.toLowerCase();
      const checkUser = await findUser(Email);
      if (checkUser) {
        return res.status(409).json({
          success: false,
          error: 'Sorry, a similar record exist. Consider logging in or checking if your email is spelt correctly.',
        });
      }
      const hash = await bcrypt.hash(password, 10);
      const signUpDetails = {
        email: Email, firstName: firstname, lastName: lastname, password: hash
      };
      const createUser = await signUpUser(signUpDetails);
      if (createUser) {
        await sendGrid.verifyUser(email, firstName);
        const token = await generateToken({ createUser });
        return res.status(201).json({
          success: true,
          message: 'User created successfully, Please check your mail box to verify your email address',
          token,
        });
      }
      return res.status(400).json({
        success: false,
        error: 'User not created',
      });
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }

  static async verifyUser(req, res) {
    try {
      const { email } = req.params;
      const verifyAccount = await verifyUser(email);
      if (verifyAccount) {
        res.status(200).json({ success: true, message: 'Email Verification successful!' });
        // res.redirect("https://team-healthify.netlify.app/verify")
      }
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }

  static async userSignin(req, res) {
    try {
      const { email, password } = req.body;
      const user = await findUser(email);
      if (!user) return res.status(404).json({ success: false, error: 'Provided email address does not exist' });
      const verifyPassword = await bcrypt.compare(password, user.password);
      if (!verifyPassword) return res.status(404).json({ success: false, error: 'Password is incorrect' });
      if (user.verified === false) return res.status(401).json({ success: false, error: 'Please verify your account to continue!' });
      const token = await generateToken({ user });
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.decoded.user;
      const { BVN, phoneNumber } = req.body;
      const details = await updateDetails(id, BVN, phoneNumber);
      if (details) {
        return res.status(200).json({
          success: true,
          message: 'User details updated successfully'
        });
      }
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await getAllUser();
      return res.status(200).json({
        success: true,
        message: 'All Users retrieved',
        count: users.length,
        data: users
      });
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }

  static async addHealthPlan(req, res) {
    try {
      const { id } = req.decoded.user;
      const { healthPlan } = req.body;
      const addPlan = await chooseHealthPlan(id, healthPlan);
      if (addPlan) {
        return res.status(200).json({
          success: true,
          message: 'Health Plan Added Successfully'
        });
      }
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }

  static async removeUser(req, res) {
    try {
      const { id } = req.decoded.user;
      const deleteAccount = await deleteUser(id);
      if (deleteAccount) {
        return res.status(200).json({ success: true, message: 'Account deleted successfully' });
      }
    } catch (error) {
      return res.status(500).json({ status: 500, error: 'Server error.' });
    }
  }
}
