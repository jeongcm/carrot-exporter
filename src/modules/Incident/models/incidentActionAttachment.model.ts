import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IIncidentActionAttachment } from '../../../common/interfaces/incidentActionAttachment.interface';

export type IIncidentActionAttachmentCreationAttributes = Optional<
  IIncidentActionAttachment,
  | 'incidentActionAttachmentKey'
  | 'incidentActionAttachmentId'
  | 'incidentActionKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'incidentActionAttachmentName'
  | 'incidentActionAttachmentDescription'
  | 'incidentActionAttachmentType'
  | 'incidentActionAttachmentFilename'
  | 'incidentActionAttachmentFileType'
  | 'incidentActionAttachmentPath'
>;

export class IncidentActionAttachmentModel
  extends Model<IIncidentActionAttachment, IIncidentActionAttachmentCreationAttributes>
  implements IIncidentActionAttachment
{
  public incidentActionAttachmentKey: number;
  public incidentActionAttachmentId: string;
  public incidentActionKey: number;
  public createdBy: string;
  public updatedBy: string;
  public deletedAt: Date;

  public incidentActionAttachmentName: string;
  public incidentActionAttachmentDescription: string;
  public incidentActionAttachmentType: 'JSON' | 'IMAGE' | 'PDF';
  public incidentActionAttachmentFilename: string;
  public incidentActionAttachmentFileType: string;
  public incidentActionAttachmentPath: JSON;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof IncidentActionAttachmentModel {
  IncidentActionAttachmentModel.init(
    {
      incidentActionAttachmentKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      incidentActionAttachmentId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      incidentActionKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING(16),
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      incidentActionAttachmentName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      incidentActionAttachmentDescription: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      incidentActionAttachmentType: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      incidentActionAttachmentFilename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      incidentActionAttachmentFileType: {
        type: DataTypes.STRING(10),
        defaultValue: null,
      },
      incidentActionAttachmentPath: {
        type: DataTypes.JSON,
        defaultValue: null,
      },
    },
    {
      tableName: 'IncidentActionAttachment',
      modelName: 'IncidentActionAttachment',
      sequelize,
    },
  );

  return IncidentActionAttachmentModel;
}
