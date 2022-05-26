import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ISubscriptionHistory } from '@/common/interfaces/subscription.interface';
import { DATE } from 'sequelize';

export type SubscriptionHistoryCreationAttributes = Optional<
    ISubscriptionHistory,
    | "subscriptionHistoryId"
    | "subscriptionHistoryKey"
    | "subscriptionKey"
    | "subscriptionNewStatus"
    | "subscriptionOldStatus"
    | "subscriptionNewCommitment"
    | "subscriptionOldCommitment"
    | "subscriptionStatusChangeReason"
    | "subscriptionCommitmentChangeReason"
    | "subscriptionChangedAt"
    | "createdAt"
    | "createdBy"
    | "deletedAt"
    | "updatedAt"
    | "updatedBy"
>;

export class SubscriptionHistoryModel extends Model<ISubscriptionHistory, SubscriptionHistoryCreationAttributes> implements ISubscriptionHistory {
    public subscriptionHistoryKey: number;
    public subscriptionHistoryId: string;
    public subscriptionKey: number;
    public deletedAt: Date;
    public createdBy: string;
    public updatedBy: string;
    public subscriptionOldStatus: 'AC' | 'SP' | 'TM';
    public subscriptionNewStatus: 'AC' | 'SP' | 'TM';
    public subscriptionStatusChangeReason: 'BD';
    public subscriptionOldCommitment: 'AC' | 'MM' ;
    public subscriptionNewCommitment: 'AC' | 'MM' ;
    public subscriptionCommitmentChangeReason: "EA"
    public subscriptionChangedAt: Date;
    public updatedAt: Date;

    public readonly createdAt!: Date;
    
}

export default function (sequelize: Sequelize): typeof SubscriptionHistoryModel {
    SubscriptionHistoryModel.init(
        {
            subscriptionHistoryKey: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            subscriptionHistoryId: {
                primaryKey: false,
                allowNull: false,
                type: DataTypes.STRING(16)
            },
            subscriptionKey: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },

            subscriptionOldStatus: {
                allowNull: true,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'SP', 'TM', null]],
                        msg: " subscriptionStatus must be of type  ['AC' |'SP' | 'TM'] AC: Active| 계약중, SP: Suspended| 일시정지, TM: Terminated, 해지"
                    }
                }
            },
            subscriptionNewStatus: {
                allowNull: true,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'SP', 'TM', null]],
                        msg: " subscriptionStatus must be of type  ['AC' |'SP' | 'TM'] AC: Active| 계약중, SP: Suspended| 일시정지, TM: Terminated, 해지"
                    }
                }
            },
            subscriptionStatusChangeReason: {
                allowNull: true,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['BD', null]],
                        msg: " subscriptionStatusChangeReason must be of type  ['BD'] BD: Suspended by billing delinquency | 연체 일시정지"
                    }
                }
                
            },
            subscriptionOldCommitment: {
                allowNull: true,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'MM', null]],
                        msg: " subscriptionCommitmentType must be of type  ['AC' ,'MM'] AC: Annual Contract | 연간계약, MM : Month to Month|월간계약"
                    }
                }
            },
            subscriptionNewCommitment: {
                allowNull: true,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'MM', null]],
                        msg: " subscriptionCommitmentType must be of type  ['AC' ,'MM'] AC: Annual Contract | 연간계약, MM : Month to Month|월간계약"
                    }
                }
            },
            subscriptionCommitmentChangeReason: {
                allowNull: true,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [["EA", null]],
                        msg: " subscriptionCommitmentChangeReason  must be of type  ['EA'] EA : End of annual contract| 연간계약종료 "
                    }
                }
            },
            subscriptionChangedAt: {
                allowNull: true,
                type: DataTypes.DATE,
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

            tableName: 'SubscritptionHistory',
            modelName: 'SubscritptionHistory',
            indexes: [
                {
                    unique: true,
                    fields: ['subscription_history_id'],
                }
            ],
            sequelize,
        },
    );

    return SubscriptionHistoryModel;
}
