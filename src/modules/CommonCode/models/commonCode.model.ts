import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';

export type CommonCodeCreationAttributes = Optional<
  ICommonCode,
  'pk' | 'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'description' | 'displayEng' | 'displayKOR'
>;

export class CommonCodeModel extends Model<ICommonCode, CommonCodeCreationAttributes> implements ICommonCode {
  public pk: number;
  public id: string;
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
      pk: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        primaryKey: false,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        unique: true
      },
      createdBy: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      isDeleted: {
        allowNull: true,
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
