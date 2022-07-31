import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IEvaluation } from '@/common/interfaces/evaluate.interface';

export type EvaluationAttribute = Optional<
IEvaluation,
  | 'evaluationKey'
  | 'evaluationId'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'evaluatedAt'  
  | 'requestedAt'  
  | 'evaluationRequest'
  | 'evaluationResult'
  | 'evaluationResultStatus'
  | 'evaluationStatus'
  | 'anomalyMonitoringTargetKey'
>;

export class EvaluationModel extends Model<IEvaluation, EvaluationAttribute> implements IEvaluation {
  public evaluationKey: number;
  public evaluationId: string;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;
  public updatedAt: Date;
  public evaluatedAt: Date;
  public requestedAt: Date;
  public evaluationResultStatus: string;
  public evaluationStatus: string;
  public evaluationRequest:JSON
  public evaluationResult:JSON
  public readonly createdAt!: Date;
  public anomalyMonitoringTargetKey: number;
  
}

export default function (sequelize: Sequelize): typeof EvaluationModel {
    EvaluationModel.init(
    {
      evaluationKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      evaluationId: {
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
      requestedAt: {
        type: DataTypes.DATE,
      },
      evaluatedAt: {
        type: DataTypes.DATE,
      },
      evaluationRequest: {
        type: DataTypes.JSON(),
      },
      evaluationResult: {
        type: DataTypes.JSON(),
      },
      evaluationResultStatus: {
        type: DataTypes.STRING(2),
      },
      evaluationStatus: {
        type: DataTypes.STRING(2),
      },
      anomalyMonitoringTargetKey: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'Evaluation',
      modelName: 'Evaluation',
      sequelize,
    },
  );

  return EvaluationModel;
}
