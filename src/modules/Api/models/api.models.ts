import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IApi } from '@common/interfaces/api.interface';

export type ApiCreationAttributes = Optional<
  IApi,
  | 'apiKey'
  | 'apiId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'apiName'
  | 'apiDescription'
  | 'apiEndPoint1'
  | 'apiEndPoint2'
  | 'apiVisibleTF'
>;

export class ApiModel extends Model<IApi, ApiCreationAttributes> implements IApi {
  public apiKey: number;
  public apiId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public apiName: string;
  public apiDescription: string;
  public apiEndPoint1: string;
  public apiEndPoint2: string;
  public apiVisibleTF: Boolean;
  public updatedAt: Date;

  public readonly createdAt!: Date;

}

export default function (sequelize: Sequelize): typeof ApiModel {
  ApiModel.init(
    {
      apiKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      apiId: {
        allowNull: false,
        type: DataTypes.STRING(16),
        unique: true,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      apiName: {
        allowNull: false,
        type: DataTypes.STRING(500),
        unique: true // don't remove the unique index
      },
      apiDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      apiEndPoint1: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      apiEndPoint2: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      apiVisibleTF: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: 'Api',
      modelName: 'Api',
      sequelize,
    },
  );

  return ApiModel;
}
