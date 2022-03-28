import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';

export type CommonCodeCreationAttributes = Optional<
  ICommonCode,
  'commonCodeKey' | 'commonCodeId' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'description' | 'displayEng' | 'displayKOR'
>;

export class CommonCodeModel extends Model<ICommonCode, CommonCodeCreationAttributes> implements ICommonCode {
  public commonCodeKey: number;
  public commonCodeId: string;
  public createdBy: string;
  public updatedBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public isDeleted: boolean;
  public description: string;
  public displayEng: string;
  public displayKOR: string;
}

export default function (sequelize: Sequelize): typeof CommonCodeModel {
  CommonCodeModel.init(
    {
      commonCodeKey: {
        type: DataTypes.BIGINT,
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
      isDeleted: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      description: {
        type: DataTypes.STRING(500),
      },
      displayEng: {
        type: DataTypes.STRING(100),
      },
      displayKOR: {
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
