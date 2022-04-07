import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import {ISubscriptions } from '@/common/interfaces/subscription.interface';
import { DATE } from 'sequelize';

export type CatalogPlanCreationAttributes = Optional<
ISubscriptions,
|"subscriptionKey"
|"catalogPlanKey"
|"customerAccountKey"
|"subscriptionId"
|"deletedAt"
|"createdAt"
|"updatedAt"
|"createdBy"
|"updatedBy"
|"subscriptionActivatedAt"
|"subscriptionStatus"
|"subscriptionConsent"
|"subscriptionTerminatedAt"
|"subscriptionCommitmentType"
>;

export class SubscriptionModel extends Model<ISubscriptions, CatalogPlanCreationAttributes> implements ISubscriptions {
    public subscriptionKey: number;
    public subscriptionId: string;
    public catalogPlanKey:number;
    public customerAccountKey: number;
    public deletedAt:Date;
    public createdBy: string;
    public updatedBy: string;
    public subscriptionActivatedAt :Date;
    public subscriptionTerminatedAt:Date;
    public subscriptionStatus :'AC' |'SP' | 'TM';
    public subscriptionConsent :boolean;
    public subscriptionCommitmentType:string

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof SubscriptionModel {
  SubscriptionModel.init(
    {
      subscriptionKey: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      subscriptionId: {
        primaryKey: false,
        allowNull: false,
        type: DataTypes.STRING(16)
      },
      catalogPlanKey: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      customerAccountKey: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      subscriptionActivatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      subscriptionTerminatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      subscriptionStatus: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
              args: [['AC' ,'SP' , 'TM']],
              msg: " subscriptionStatus must be of type  ['AC' |'SP' | 'TM'] AC: Active| 계약중, SP: Suspended| 일시정지, TM: Terminated, 해지"
          }
        }
      },
      subscriptionConsent: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      subscriptionCommitmentType: {
        allowNull: false,
        type: DataTypes.STRING(2),
        validate: {
          isIn: {
              args: [['AC' ,'MM']],
              msg: " subscriptionCommitmentType must be of type  ['AC' ,'MM'] AC: Annual Contract | 연간계약, MM : Month to Month|월간계약"
          }
        }
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE()
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.STRING(16)
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.STRING(16)
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(),
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE(),
        defaultValue: new Date()
      },
    },
    
    {
      
      tableName: 'Subscription',
      modelName: 'Subscription',
      indexes: [
        {
          unique: true,
          fields: ['subscription_id'],
        }
      ],
      sequelize,
    },
  );

  return SubscriptionModel;
}
