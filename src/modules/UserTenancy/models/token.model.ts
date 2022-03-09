import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IToken } from '@/common/interfaces/token.interface';

export type TenancyCreationAttributes = Optional<IToken, 'id' | 'userPk' | 'token' | 'expiryTime' | 'maximumLimit' | 'createdAt' | 'updatedAt'>;

export class TokenModel extends Model<IToken> implements IToken {
  public pk: number;
  public userPk: number;
  public token: string;
  public maximumLimit: number;
  public expiryTime: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof TokenModel {
  try {
    TokenModel.init(
      {
        pk: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        userPk: {
          allowNull: true,
          type: DataTypes.BIGINT,
        },
        token: {
          allowNull: true,
          type: DataTypes.STRING,
        },
        maximumLimit: {
          allowNull: true,
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
        expiryTime: {
          allowNull: true,
          type: DataTypes.BIGINT,
          defaultValue: Date.now() + 36000000,
        },
        createdAt: {
          allowNull: true,
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: true,
          defaultValue: new Date(),
          type: DataTypes.DATE,
        },
      },
      {
        tableName: 'Tokens',
        sequelize,
      },
    );
  } catch (err) {
    console.log(err);
  }
  return TokenModel;
}
