export interface IResponseMassUploader {
//    fieldCount: number;
//    affectedRows: number;
//    insertId: number;
//    info: string;
    targetTable: string;
}

export interface IRquestMassUploaderMongo {
    resource_Name: string,
    resource_Description: string,
    resource_Namespace: string,
    resource_Type: string,
    resource_Group_Uuid: string,
    resource_Target_Uuid: string,
    customer_Account_Key: number,
    resource_Group_Key: number,
    resource_Rbac: boolean,
    resource_Anomaly_Monitor: boolean,
    resource_Active: boolean,
    resource_Status_Updated_At: Date,
    resource_Level1: string,
    resource_Target_Created_At: Date,
    resource_Instance: string,
}

export interface IRequestMassUploader {
    resource_Type: string,
    resource_Group_Uuid: string,
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
                resource_Pod_Phase: string,
                resource_Pod_Container: object,
                resource_Pod_Volume: object,
                resource_Replicas: string,
                resource_Sts_volume_Claim_Templates: object,
                resource_Pvc_Storage: object,
                resource_Pvc_Volumne_Name: string,
                resource_Pvc_Storage_Class_Name: string,
                resource_Pvc_Volume_Mode: string,
                resource_Endpoint: object,
                resource_Configmap_Data: object,
                resource_Ingress_Class: string,
                resource_Ingress_Rules: object,
                resource_Pv_Storage: string,
                resource_Pv_Claim_Ref: object,
                resoruce_Pv_Storage_Class_Name: string,
                resource_Pv_Volume_Mode: string,
                resource_Sc_Provisioner: string, 
                resource_Sc_Reclaim_Policy: string, 
                resource_Sc_Allow_Volume_Expansion: string, 
                resource_Sc_Volume_Binding_Mode: string,                                
                resource_Rbac: boolean,
                resource_Anomaly_Monitor: boolean,
                resource_Active: boolean,
                resoruce_Status_Updated_At: Date,
                resource_Description: string,
                resource_Owner_References: string,
            
            }[],
}