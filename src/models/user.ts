import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  IsEmail,
  Length,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { UserRole } from '@/types/common.types';

@Table({
  tableName: 'Users',
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['role'] },
    { fields: ['verified'] },
    { fields: ['createdAt'] },
  ],
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @IsEmail
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Length({ min: 2, max: 50 })
  @Column(DataType.STRING)
  declare firstName: string;

  @AllowNull(false)
  @Length({ min: 2, max: 50 })
  @Column(DataType.STRING)
  declare lastName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare verified: boolean;

  @Column(DataType.BIGINT)
  declare phoneNumber?: bigint | null;

  @Column(DataType.BIGINT)
  declare BVN?: bigint | null;

  @Column(DataType.STRING)
  declare healthPlan?: string | null;

  @AllowNull(false)
  @Default('User')
  @Column(DataType.ENUM('Super Admin', 'Admin', 'User'))
  declare role: UserRole;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Instance methods
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isAdmin(): boolean {
    return this.role === 'Admin' || this.role === 'Super Admin';
  }

  public isSuperAdmin(): boolean {
    return this.role === 'Super Admin';
  }

  // Convert to safe JSON (without password)
  public toSafeJSON() {
    const userJson = this.toJSON();
    const { password, ...safeUser } = userJson;
    return safeUser;
  }
}

export default User;
