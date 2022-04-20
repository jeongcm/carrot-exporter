import config from 'config';
import { isEmpty } from '@/common/utils/util';
import { IParty } from '@/common/interfaces/party.interface';
import { IResponseMassUploader, IRequestMassUploader } from '@/common/interfaces/massUploader.interface';
import { HttpException } from '@/common/exceptions/HttpException';
import { arrayBuffer } from 'stream/consumers';
import resourceModel from '@/modules/Resources/models/resource.model';


class massUploaderService {

    public async massUploadResource (resourceMassFeed: IRequestMassUploader ): Promise<IResponseMassUploader> {

        const targetTable ="Resource";
        var fieldCount = 0;
        var affectedRows = 0;
        var insertId = 0;
        var info = "";

        console.log("**********************************");
        console.log(" db connect for raw SQL execution");
        console.log("**********************************");

        const mysql = require('mysql2');
        const mysqlConnection = mysql.createConnection({
            host: config.db.mariadb.host,
            user: config.db.mariadb.user,
            port: config.db.mariadb.port || 3306,
            password: config.db.mariadb.password,
            database: config.db.mariadb.dbName,
//          minimumpoolsize: config.db.mariadb.poolMin,
//          maximumpoolsize: config.db.mariadb.poolMin,
        })
        
        const sizeOfInput = resourceMassFeed.resource.length; 
     //   const query1 = `INSERT INTO Resource (resource_Id, created_By, created_At, resource_Target_Uuid, resource_Target_Created_At, 
     //                   resource_Name, resource_Type, resource_Labels, resource_Annotations, resource_Description,
     //                   resource_Level1, resource_Level2, resource_Level3, resource_Level4, resource_Level_Type, 
     //                   resource_Pod_Phase, resource_Pod_Container, resource_Replicas, resource_Sts_volume_Claim_Templates,
     //                   resource_Pvc_Storage, resource_Pvc_Volume_Name, resource_Pvc_Storage_Class_Name, resource_Pvc_Volume_Mode, resource_Endpoint,
     //                   resource_Configmap_Data, resource_Ingress_Class, resource_Ingress_Rules,
     //                   resource_Pv_Storage, resource_Pv_Claim_Ref, resource_Pv_Storage_Class_Name, resource_Pv_Volume_Mode,
     //                   resource_Rbac, resource_Anomaly_Monitor, resource_Active, 
     //                   customer_Account_Key, resource_Group_Key ) VALUES ?`; 
        const query1 = `INSERT INTO Resource (resource_Id, created_By, created_At, resource_Target_Uuid, resource_Target_Created_At, 
                        resource_Name, resource_Type, resource_Description,
                        resource_Level1, resource_Level2, resource_Level3, resource_Level4, resource_Level_Type, 
                        resource_Rbac, resource_Anomaly_Monitor, resource_Active, 
                        customer_Account_Key, resource_Group_Key ) VALUES ?`; 
     
        var query2 = new Array;

        for (var i=0; i<sizeOfInput; i++ ) {
            var resource_id  = "key" + i; 
            console.log (resource_id); 

            var resource_Target_Created_At = new Date(resourceMassFeed.resource[i].resource_Target_Created_At);

            query2[i] =  [
                            resource_id,  //resource_Id
                            "SYSTEM",  // created_By
                            new Date(), //created_At
                            resourceMassFeed.resource[i].resource_Target_Uuid,  //resource_Target_Uuid, 
                            resource_Target_Created_At, // resource_Target_Created_At
                            resourceMassFeed.resource[i].resource_Name, // resource_Name
                            resourceMassFeed.resource[i].resource_Type,   // resource_Type
                          // resourceMassFeed.resource[i].resource_Labels,
                          //  resourceMassFeed.resource[i].resource_Annotations,
                            resourceMassFeed.resource[i].resource_Description,
                            resourceMassFeed.resource[i].resource_Level1,
                            resourceMassFeed.resource[i].resource_Level2,    
                            resourceMassFeed.resource[i].resource_Level3,    
                            resourceMassFeed.resource[i].resource_Level4,    
                            resourceMassFeed.resource[i].resource_Level_Type,
                           // resourceMassFeed.resource[i].resource_Pod_Phase,    
                           // resourceMassFeed.resource[i].resource_Pod_Container,    
                           // resourceMassFeed.resource[i].resource_Replicas,
                           // resourceMassFeed.resource[i].resource_Sts_volume_Claim_Templates,
                           // resourceMassFeed.resource[i].resource_Pvc_Storage,
                           // resourceMassFeed.resource[i].resource_Pvc_Volumne_Name,
                           // resourceMassFeed.resource[i].resource_Pvc_Storage_Class_Name,
                           // resourceMassFeed.resource[i].resource_Pvc_Volume_Mode,
                           // resourceMassFeed.resource[i].resource_Endpoint,
                           // resourceMassFeed.resource[i].resource_Configmap_Date,
                           // resourceMassFeed.resource[i].resource_Ingress_Class,
                           // resourceMassFeed.resource[i].resource_Ingress_Rules,
                           // resourceMassFeed.resource[i].resource_Pv_Storage,
                           // resourceMassFeed.resource[i].resource_Pv_Claim_Ref,
                           // resourceMassFeed.resource[i].resoruce_Pv_Storage_Class_Name,
                           // resourceMassFeed.resource[i].resource_Pv_Volume_Mode,
                            resourceMassFeed.resource[i].resource_Rbac,    
                            resourceMassFeed.resource[i].resource_Anomaly_Monitor,
                            resourceMassFeed.resource[i].resource_Active,
                            1,  //customer_Account_Key
                            1 //resource_Group_Kep 17 total columns
                        ];
            resource_Target_Created_At = null;            
        }

        mysqlConnection.connect((err) => {
           if (err) throw err;
           console.log ('DB connected for raw SQL run')
        });

        mysqlConnection.query(query1, [query2], function( sqlError, sqlResult) {
            if (sqlError) {
                mysqlConnection.rollback();
                console.log (sqlError); 
            } else {
                mysqlConnection.commit();
                fieldCount = sqlResult.fieldCount; 
                affectedRows = sqlResult.affectedRows;
                insertId = sqlResult.insertId;
                info = sqlResult.info;
                console.log (sqlResult); 
            }
        });
        
        mysqlConnection.end();

        const updateResult: IResponseMassUploader = {
                                fieldCount, 
                                affectedRows,
                                insertId,
                                info,
                                targetTable };
        return updateResult;


    };
}    

export default massUploaderService;