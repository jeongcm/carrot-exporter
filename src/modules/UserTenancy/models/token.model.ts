import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IToken } from '@/common/interfaces/token.interface';

export type TenancyCreationAttributes = Optional<IToken, 'tokenKey'|'tokenId' | 'token' | 'expiryTime' | 'maximumLimit' | 'createdAt' | 'updatedAt'>;

export class TokenModel extends Model<IToken> implements IToken {
  public tokenKey: number;
  public tokenId: string;
  public partyUserKey: number;
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
        tokenKey: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        tokenId: {
          allowNull: false,
          type: DataTypes.STRING(16),
          unique: true
        },
        partyUserKey: {
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
          defaultValue: 4,
        },
        expiryTime: {
          allowNull: true,
          type: DataTypes.BIGINT,
          defaultValue: Date.now() + 3600000,
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
