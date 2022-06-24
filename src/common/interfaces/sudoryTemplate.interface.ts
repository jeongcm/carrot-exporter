export interface ISudoryTemplate {
    sudoryTemplateKey: number;
    sudoryTemplateId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    sudoryTemplateName: string;
    sudoryTemplateDescription: string;
    sudoryTemplateUuid: string;
    sudoryTemplateArgs: JSON;
    subscribedChannel: string;
}