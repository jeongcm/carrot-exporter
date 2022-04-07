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
    public subscriptionOldStatus: string;
    public subscriptionNewStatus: string;
    public subscriptionStatusChangeReason: string;
    public subscriptionOldCommitment: string;
    public subscriptionNewCommitment: string
    public subscriptionCommitmentChangeReason: string
    public subscriptionChangedAt: Date

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
                allowNull: true,
                type: DataTypes.INTEGER,
            },

            subscriptionOldStatus: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'SP', 'TM']],
                        msg: " subscriptionStatus must be of type  ['AC' |'SP' | 'TM'] AC: Active| 계약중, SP: Suspended| 일시정지, TM: Terminated, 해지"
                    }
                }
            },
            subscriptionNewStatus: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'SP', 'TM']],
                        msg: " subscriptionStatus must be of type  ['AC' |'SP' | 'TM'] AC: Active| 계약중, SP: Suspended| 일시정지, TM: Terminated, 해지"
                    }
                }
            },
            subscriptionStatusChangeReason: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['BD']],
                        msg: " subscriptionStatusChangeReason must be of type  ['BD'] BD: Suspended by billing delinquency | 연체 일시정지"
                    }
                }
            },
            subscriptionOldCommitment: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'MM']],
                        msg: " subscriptionCommitmentType must be of type  ['AC' ,'MM'] AC: Annual Contract | 연간계약, MM : Month to Month|월간계약"
                    }
                }
            },
            subscriptionNewCommitment: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['AC', 'MM']],
                        msg: " subscriptionCommitmentType must be of type  ['AC' ,'MM'] AC: Annual Contract | 연간계약, MM : Month to Month|월간계약"
                    }
                }
            },
            subscriptionCommitmentChangeReason: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [["EA"]],
                        msg: " subscriptionCommitmentChangeReason  must be of type  ['EA'] EA : End of annual contract| 연간계약종료 "
                    }
                }
            },
            subscriptionChangedAt: {
                allowNull: false,
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
