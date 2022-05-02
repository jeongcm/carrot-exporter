import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';

export type CommonCodeCreationAttributes = Optional<
  ICommonCode,
  'commonCodeKey' | 'commonCodeId' | 'commonCodeName' | 'commonCodeCode' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'commonCodeDescription' | 'commonCodeDisplayENG' | 'commonCodeDisplayKOR'
>;

export class CommonCodeModel extends Model<ICommonCode, CommonCodeCreationAttributes> implements ICommonCode {
  public commonCodeKey: number;
  public commonCodeId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public commonCodeName: string;
  public commonCodeCode: string;
  public commonCodeDescription: string;
  public commonCodeDisplayENG: string;
  public commonCodeDisplayKOR: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CommonCodeModel {
  CommonCodeModel.init(
    {
      commonCodeKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      commonCodeId: {
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
      commonCodeName: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      commonCodeCode: {
        allowNull: false,
        type: DataTypes.STRING(2),
        unique: true
      },            
      commonCodeDescription: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      commonCodeDisplayENG: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      commonCodeDisplayKOR: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
    },
    {
      tableName: 'CommonCode',
      modelName: 'CommonCode',
      sequelize,
    },
  );

  return CommonCodeModel;
}
