import db from '../../models';

export default class userServices {
  static async signUpUser(signupDetails) {
    try {
      return await db.Users.create(signupDetails);
    } catch (error) {
      return error;
    }
  }

  static async findUser(email) {
    try {
      return await db.Users.findOne({
        where: { email },
      });
    } catch (error) {
      return error;
    }
  }

  static async getById(id) {
    try {
      return await db.Users.findOne({
        where: { id }
      });
    } catch (error) {
      return error;
    }
  }

  static async getAllUser() {
    try {
      return await db.Users.findAll({});
    } catch (error) {
      return error;
    }
  }

  static async updateDetails(id, BVN, phoneNumber) {
    try {
      return await db.Users.update({ BVN, phoneNumber }, {
        where: { id },
        returning: true,
        plain: true,
      });
    } catch (error) {
      return error;
    }
  }

  static async chooseHealthPlan(id, healthPlan) {
    try {
      return await db.Users.update({ healthPlan }, {
        where: { id },
        returning: true,
        plain: true,
      });
    } catch (error) {
      return error;
    }
  }

  static async deleteUser(id) {
    try {
      return db.Users.destroy({
        where: { id },
      });
    } catch (error) {
      return error;
    }
  }

  static async verifyUser(email) {
    try {
      return await db.Users.update({
        verified: true,
      }, {
        where: {
          email,
        },
        returning: true,
        plain: true,
      });
    } catch (error) {
      return error;
    }
  }
}
