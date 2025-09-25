import bcrypt from 'bcrypt';
import { QueryInterface, DataTypes, Op } from 'sequelize';
import { UserRole } from '../../types/common.types';

interface SeedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  verified: boolean;
  role: UserRole;
  phoneNumber?: bigint | null;
  BVN?: bigint | null;
  healthPlan?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const migration = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    // Use modern bcrypt with higher salt rounds for security
    const password = 'ModernSecurePassword2024!';
    const hash = await bcrypt.hash(password, 12);

    const now = new Date();
    const seedUsers: SeedUser[] = [
      {
        id: 'c7d5fb3e-60cd-4159-b3ab-369d16a12bfc',
        email: 'admin@assurehealth.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hash,
        role: 'Admin',
        verified: true,
        phoneNumber: null,
        BVN: null,
        healthPlan: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'f8e9d0b1-2c3d-4e5f-6789-abcdef123456',
        email: 'user@assurehealth.com',
        firstName: 'Regular',
        lastName: 'User',
        password: hash,
        role: 'User',
        verified: true,
        phoneNumber: null,
        BVN: null,
        healthPlan: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'superadmin@assurehealth.com',
        firstName: 'Super',
        lastName: 'Admin',
        password: hash,
        role: 'Super Admin',
        verified: true,
        phoneNumber: null,
        BVN: null,
        healthPlan: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Users', seedUsers, {});
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('Users', {
      email: {
        [Op.in]: [
          'admin@assurehealth.com',
          'user@assurehealth.com',
          'superadmin@assurehealth.com'
        ]
      }
    }, {});
  },
};

module.exports = migration;
