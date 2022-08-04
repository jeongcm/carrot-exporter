import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IExecutorService } from '@/common/interfaces/executor.interface';


export type ExecutorServiceUpdateAttributes = Optional<
IExecutorService,
  | 'executorServiceKey'
  | 'executorServiceId'
  | 'customerAccountKey'
  | 'name'
  | 'summary'
  | 'clusterUuid' 
  | 'templateUuid' 
  | 'serviceUuid'
  | 'onCompletion'
  | 'subscribedChannel'
  | 'steps' 
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedAt'
  | 'status'
  | 'statusDescription'
>;

export class ExecutorServiceModel extends Model<IExecutorService, ExecutorServiceUpdateAttributes> implements IExecutorService {
  public executorServiceKey: number;
  public executorServiceId: string;
  public customerAccountKey: number;
  public name: string;
  public summary: string;
  public onCompletion: number;
  public subscribedChannel: string;
  public templateUuid: string;
  public serviceUuid: string;
  public clusterUuid: string;
  public steps: JSON;
  public status: number;
  public statusDescription: string;
  
  public deletedAt: Date;
  public createdBy: string;
  public updatedBy: string;
  public updatedAt: Date;

  public readonly createdAt!: Date;

}

export default function (sequelize: Sequelize): typeof ExecutorServiceModel {
  ExecutorServiceModel.init(
    {
      executorServiceKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      executorServiceId: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      clusterUuid: {
        type: DataTypes.STRING(100),
      },
      serviceUuid: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      templateUuid: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      summary: {
        allowNull: false,
        type: DataTypes.STRING(500),
      },
      onCompletion: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      subscribedChannel: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      status: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      statusDescription: {
        allowNull: true,
        type: DataTypes.STRING(500),
      },
      steps: {
        allowNull: true,
        type: DataTypes.JSON,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16),
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
      },
    },
    {
      tableName: 'ExecutorService',
      modelName: 'ExecutorService',
      sequelize,
    },
  );

  return ExecutorServiceModel;
}

