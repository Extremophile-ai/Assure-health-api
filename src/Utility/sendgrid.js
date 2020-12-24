import dotenv from 'dotenv';
import sendMail from '@sendgrid/mail';

dotenv.config();

sendMail.setApiKey(process.env.SENDGRID_API_KEY);
let hostURL = 'https://healthify-app.herokuapp.com';

// let hostURL =`http://localhost:${process.env.PORT || 5000}`;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  hostURL = `http://localhost:${process.env.PORT || 4000}`;
}

const msg = {
  from: `Assure Health <${process.env.SENDGRID_EMAIL}>`,
  mail_settings: {
    sandbox_mode: {
      enable: false
    },
  }
};

/**

 */
export default class {
  static sandboxMode() {
    msg.mail_settings.sandbox_mode.enable = true;
  }

  /**
   * @param {string} email - The user"s email
   * @param {string} User - The User"s username
   * @param {string} route - Specifies route for verification
   * @returns {object} Verification message
   */
  static async verifyUser(email, firstName) {
    const link = `${hostURL}/user/verify_mail/${email}`;
    msg.to = email;
    msg.subject = 'Verification Email';
    msg.text = `${firstName}, Please click the following link to confirm your mail
    ${link}`;
    try {
      await sendMail.send(msg);
      console.log('email sent');
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}
