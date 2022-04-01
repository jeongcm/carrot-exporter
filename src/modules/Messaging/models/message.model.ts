import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { IMessage } from '@/common/interfaces/message.interface';

import { ITableId } from '@/common/interfaces/tableId.interface';

export type CreateMessageAttributes = Optional<
    IMessage,
    | "messageId"
    | "messageKey"
    | "messageType"
    | "messageVerbiage"
    | "customerAccountKey"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "updatedBy"
    | "isDeleted"
>;



export class MessageModel extends Model<IMessage, CreateMessageAttributes> implements IMessage {
    public messageKey: number;
    public messageId: string;
    public messageType: 'MK' | 'BL' | 'OP' | 'PY';
    public customerAccountKey: number;
    public messageVerbiage: string;

    public isDeleted: Date;
    public createdBy: string;
    public updatedBy: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;


}

export default function (sequelize: Sequelize): typeof MessageModel {
    MessageModel.init(
        {
            messageKey: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            messageId: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING(16),
            },
            messageType: {
                allowNull: false,
                type: DataTypes.STRING(2),
                validate: {
                    isIn: {
                        args: [['MK', 'BL', 'OP', 'PY']],
                        msg: " message must be of type  ['MK' ,'BL' , 'OP', 'PY'] MK: marketing, BL: billing, OP: operations, PY: payment in commonCode customerAccountKey : number;"
                    }
                }
            },
            customerAccountKey: {
                allowNull: false,
                type: DataTypes.BIGINT,
            },
            messageVerbiage: {
                allowNull: false,
                type: DataTypes.STRING(5000),
            },
            isDeleted: {
                allowNull: true,
                type: DataTypes.DATE
            },
            createdBy: {
                allowNull: false,
                type: DataTypes.STRING(16),
                defaultValue: "SYSTEM"
            },
            updatedBy: {
                allowNull: true,
                type: DataTypes.STRING(16),
                defaultValue: "SYSTEM"
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
            tableName: 'Message',
            modelName: 'Message',
            sequelize,
        },
    );

    return MessageModel;
}
