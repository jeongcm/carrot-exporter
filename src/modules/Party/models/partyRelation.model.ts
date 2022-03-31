import { PartyModel } from './party.model';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IPartyRelation } from '@/common/interfaces/party.interface';

export type PartyRelationCreationAttributes = Optional<
  IPartyRelation,
  | 'partyRelationKey'
  | 'partyRelationId'
  | 'partyParentKey'
  | 'partyChildKey'
  | 'createdBy'
  | 'updatedBy'
  | 'createdAt'
  | 'updatedAt'
  | 'isDeleted'
  | 'partyRelationType'
  | 'partyRelationFrom'
  | 'partyRelationTo'
>;

export class PartyRelationModel extends Model<IPartyRelation, PartyRelationCreationAttributes> implements IPartyRelation {
  public partyRelationKey: number;
  public partyRelationId: string;
  public partyParentKey: number;
  public partyChildKey: number;

  public createdBy: string;
  public updatedBy: string;
  public isDeleted: boolean;

  public partyRelationType: 'AU' | 'AA';
  public partyRelationFrom: Date;
  public partyRelationTo: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof PartyRelationModel {
  PartyRelationModel.init(
    {
      partyRelationKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      partyRelationId: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      partyParentKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      partyChildKey: {
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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      partyRelationType: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      partyRelationFrom: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      partyRelationTo: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'PartyRelation',
      modelName: 'PartyRelation',
      sequelize,
    },
  );

  return PartyRelationModel;
}
