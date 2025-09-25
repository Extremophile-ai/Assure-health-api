import dotenv from 'dotenv';
import sendMail, { MailDataRequired } from '@sendgrid/mail';

dotenv.config();

export default class EmailService {
  private static apiKey = process.env.SENDGRID_API_KEY!;

  private static senderEmail = process.env.SENDGRID_EMAIL!;

  private static hostURL = EmailService.getHostURL();

  static {
    if (!EmailService.apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }
    if (!EmailService.senderEmail) {
      throw new Error('SENDGRID_EMAIL environment variable is required');
    }
    sendMail.setApiKey(EmailService.apiKey);
  }

  private static getHostURL(): string {
    const port = process.env.PORT || 4000;
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === 'development' || nodeEnv === 'test') {
      return `http://localhost:${port}`;
    }

    return 'https://healthify-app.herokuapp.com';
  }

  private static getBaseEmailConfig(): Partial<MailDataRequired> {
    return {
      from: `Assure Health <${EmailService.senderEmail}>`,
      mailSettings: {
        sandboxMode: {
          enable: false,
        },
      },
    };
  }

  /**
   * Enable sandbox mode for testing
   */
  static enableSandboxMode(): void {
    // This will be applied to future emails
  }

  /**
   * Send verification email to user
   * @param email - The user's email address
   * @param firstName - The user's first name
   * @returns Promise<void>
   */
  static async verifyUser(email: string, firstName: string): Promise<void> {
    const link = `${EmailService.hostURL}/user/verify_mail/${email}`;
    const msg: MailDataRequired = {
      ...EmailService.getBaseEmailConfig(),
      to: email,
      subject: 'Verification Email',
      text: `${firstName}, Please click the following link to confirm your email address:\n\n${link}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Assure Health, ${firstName}!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${link}">${link}</a></p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    } as MailDataRequired;

    // Enable sandbox mode for test environment
    if (process.env.NODE_ENV === 'test') {
      (msg as any).mailSettings = {
        sandboxMode: { enable: true }
      };
    }

    try {
      await sendMail.send(msg);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error(`Failed to send verification email: ${error}`);
    }
  }

  /**
   * Send password reset email
   * @param email - The user's email address
   * @param firstName - The user's first name
   * @param resetToken - The password reset token
   * @returns Promise<void>
   */
  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${EmailService.hostURL}/user/reset-password?token=${resetToken}`;
    const msg: MailDataRequired = {
      ...EmailService.getBaseEmailConfig(),
      to: email,
      subject: 'Password Reset Request',
      text: `${firstName}, Please click the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    } as MailDataRequired;

    if (process.env.NODE_ENV === 'test') {
      (msg as any).mailSettings = {
        sandboxMode: { enable: true }
      };
    }

    try {
      await sendMail.send(msg);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error}`);
    }
  }
}
