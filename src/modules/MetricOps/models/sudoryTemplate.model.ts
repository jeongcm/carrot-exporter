import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ISudoryTemplate } from '@/common/interfaces/sudoryTemplate.interface';

export type SudoryTemplateAttributes = Optional<
    ISudoryTemplate,
    | 'sudoryTemplateKey'
    | 'sudoryTemplateId'
    | 'createdBy'
    | 'updatedBy'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'sudoryTemplateName'
    | 'sudoryTemplateDescription'
    | 'sudoryTemplateUuid'
    | 'sudoryTemplateArgs'
>;

export class SudoryTemplateModel extends Model<ISudoryTemplate, SudoryTemplateAttributes> implements ISudoryTemplate {
    public sudoryTemplateKey: number;
    public sudoryTemplateId: string;
    public createdBy: string;
    public updatedBy: string;
    public deletedAt: Date;
    public sudoryTemplateName: string;
    public sudoryTemplateDescription: string;
    public sudoryTemplateUuid: string;
    public sudoryTemplateArgs: JSON;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof SudoryTemplateModel {
    SudoryTemplateModel.init(
        {
            sudoryTemplateKey: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            sudoryTemplateId: {
                allowNull: false,
                type: DataTypes.STRING(100),
                unique: true
            },
            createdBy: {
                allowNull: false,
                type: DataTypes.STRING(16),
            },
            updatedBy: {
                type: DataTypes.STRING(16),
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            sudoryTemplateName: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            sudoryTemplateDescription: {
                type: DataTypes.STRING(500),
                allowNull: false
            },
            sudoryTemplateUuid: {
                type: DataTypes.STRING(),
                allowNull: false,
                unique: true
            },
            sudoryTemplateArgs: {
                type: DataTypes.JSON,
                allowNull: true
            }
        },
        {
            tableName: 'SudoryTemplate',
            modelName: 'SudoryTemplate',
            sequelize,
        },
    );

    return SudoryTemplateModel;
}
