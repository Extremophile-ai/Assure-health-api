import { User } from '@/models';
import { UserCreationAttributes } from '@/types/user.types';

export default class UserServices {
  static async signUpUser(signupDetails: UserCreationAttributes): Promise<User> {
    const user = await User.create({
      email: signupDetails.email,
      firstName: signupDetails.firstName,
      lastName: signupDetails.lastName,
      password: signupDetails.password,
      verified: signupDetails.verified || false,
      phoneNumber: signupDetails.phoneNumber || null,
      BVN: signupDetails.BVN || null,
      healthPlan: signupDetails.healthPlan || null,
      role: signupDetails.role || 'User',
    });
    return user;
  }

  static async findUser(email: string): Promise<User | null> {
    const user = await User.findOne({
      where: { email },
    });
    return user;
  }

  static async getById(id: string): Promise<User | null> {
    const user = await User.findOne({
      where: { id },
    });
    return user;
  }

  static async getAllUser(): Promise<User[]> {
    const users = await User.findAll({});
    return users;
  }

  static async updateDetails(
    id: string,
    BVN: bigint,
    phoneNumber: bigint
  ): Promise<[number, User[]]> {
    const [affectedRows, affectedUsers] = await User.update(
      { BVN, phoneNumber },
      {
        where: { id },
        returning: true,
      }
    );

    return [affectedRows, affectedUsers];
  }

  static async chooseHealthPlan(
    id: string,
    healthPlan: string
  ): Promise<[number, User[]]> {
    const [affectedRows, affectedUsers] = await User.update(
      { healthPlan },
      {
        where: { id },
        returning: true,
      }
    );

    return [affectedRows, affectedUsers];
  }

  static async deleteUser(id: string): Promise<number> {
    const result = await User.destroy({
      where: { id },
    });
    return result;
  }

  static async verifyUser(email: string): Promise<[number, User[]]> {
    const [affectedRows, affectedUsers] = await User.update(
      { verified: true },
      {
        where: { email },
        returning: true,
      }
    );

    return [affectedRows, affectedUsers];
  }
}
