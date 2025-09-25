/* eslint-disable import/no-extraneous-dependencies */
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import config from '@/config/database';
import { User } from './user';

dotenv.config();

const dbConfig = config;

// Initialize Sequelize with TypeScript support
const sequelizeOptions: any = {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging || false,
  models: [User], // Register all models here
  repositoryMode: false,
  ...(dbConfig.define && { define: dbConfig.define }),
  ...(dbConfig.pool && { pool: dbConfig.pool }),
};

export const sequelize = new Sequelize(dbConfig.url!, sequelizeOptions);

// Database interface for exporting
interface Database {
  sequelize: Sequelize;
  Users: typeof User;
}

const db: Database = {
  sequelize,
  Users: User,
};

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Sync database (use with caution in production)
export const syncDatabase = async (
  options: { force?: boolean; alter?: boolean } = {}
): Promise<void> => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

export default db;
export { User };
