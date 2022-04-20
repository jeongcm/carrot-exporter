export interface IResponseMassUploader {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    info: string;
    targetTable: string;
}

export interface IRequestMassUploader {
    resource: { resource_Group_Uuid: string, 
                resource_Name: string,
                resource_Target_Uuid: string,
                resource_Target_Created_At: Date,
                resource_Labels: object,
                resource_Annotations: object,
                resource_Namespace: string,
                resource_Instance: string,
                resource_Status: object,
                resource_Type: string,
                resource_Level1: string,
                resource_Level2: string,
                resource_Level3: string,
                resource_Level4: string,
                resource_Level_Type: string,
                resource_Rbac: boolean,
                resource_Anomaly_Monitor: boolean,
                resource_Active: boolean,
                resoruce_Status_Updated_At: Date,
                resource_Description: string,
            
            }[],
}