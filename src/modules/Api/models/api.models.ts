import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IApi } from '@common/interfaces/api.interface';

export type ApiCreationAttributes = Optional<
  IApi,
  'apiKey' | 'apiId' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'apiName' | 'apiDescription' | 'apiEndPoint1' | 'apiEndPoint2' | 'apiVisibleTF'
>;

export class ApiModel extends Model<IApi, ApiCreationAttributes> implements IApi {
    public apiKey: number;
    public apiId: string;
    public createdBy: string;
    public updatedBy: string;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;
    public apiName: string;
    public apiDescription: string;
    public apiEndPoint1: string;
    public apiEndPoint2: string;
    public apiVisibleTF: string;
}

export default function (sequelize: Sequelize): typeof ApiModel {
    ApiModel.init(
      {
        apiKey: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        apiId: {
          allowNull: false,
          type: DataTypes.STRING(16),
          unique: true
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
          type: DataTypes.STRING(500),
        },
        apiDescription: {
          type: DataTypes.STRING(500),
        },
        apiEndPoint1: {
          type: DataTypes.STRING(100),
        },
        apiEndPoint2: {
            type: DataTypes.STRING(100),
          },
        apiVisibleTF: {
            type: DataTypes.STRING(100)
        }
      },
      {
        tableName: 'Api',
        modelName: 'Api',
        sequelize,
      },
    );
  
    return ApiModel;
  }