import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IToken } from '@interfaces/token.interface';

export type CreationAttributes = Optional<
IToken,
  | 'userId1'
  | 'id'
  | 'token1'
  | 'createdAt1'
  | 'updatedAt1'
  | 'counter1'
  | 'expiresDate'
>;

export class TokenModel extends Model<IToken, CreationAttributes> implements IToken {
  public userId1: string;
  public token1: string;
  public id: string;
  public counter1: number;
  public expiresDate: number;

  public readonly createdAt1!: Date;
  public readonly updatedAt1!: Date;
}

export default function (sequelize: Sequelize): typeof TokenModel {
  TokenModel.init(
    {
      id: {
        primaryKey: true,
        allowNull: true,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID
      },
      token1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userId1: {
        type: DataTypes.UUID,
        allowNull: true
      },
      counter1: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue:0
      },
      createdAt1: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date(),
      },
      updatedAt1: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date(),
      },
      expiresDate: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: Date.now()+360000
      }
    },
    {
      tableName: 'tokens',
      sequelize,
    },
  );

  return TokenModel;
}
