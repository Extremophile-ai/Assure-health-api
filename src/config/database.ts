import type { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  url: string | undefined;
  dialect: Dialect;
  logging?: boolean | ((sql: string) => void) | undefined;
  define: {
    timestamps: boolean;
    underscored: boolean;
    freezeTableName: boolean;
  };
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}
console.log('process.env.NODE_ENV  =>', process.env.NODE_ENV);
const config: DatabaseConfig = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres' as Dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false,
  },
  pool: {
    max: process.env.NODE_ENV === 'production' ? 20 : 5,
    min: process.env.NODE_ENV === 'production' ? 5 : 0,
    acquire: process.env.NODE_ENV === 'production' ? 60000 : 30000,
    idle: 10000,
  },
};

export default config;

// Type exports for TypeScript usage
export type { DatabaseConfig };
