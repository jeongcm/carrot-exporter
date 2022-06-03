import { MongoClient } from 'mongodb';
import DB from '@/database';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import ResourceService from '@/modules/Resources/services/resource.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import config from '@config/index';


class massUploaderMongoService {

    public resource = DB.Resource;
    public resourceGroup = DB.ResourceGroup;
    public tableIdService = new TableIdService();
    public resourceService = new ResourceService();
    public resourceGroupService = new ResourceGroupService();

    public async massUploadResourceMongo(resourceMassFeed: any): Promise<object> {

        //Mongodb access - need to change to make this configurable
        const mongoUrl = config.db.mongodb.url;
        const client = new MongoClient(mongoUrl); 
        var returnResult;
        var customerAccountKey;
        var resourceGroupKey;
        var resourceGroupUuid;
        var resourceTargetUuidLocal = []; 
        const deleted_At = new Date().toISOString();
        const created_At = new Date().toISOString();
        const updated_At = new Date().toISOString();

        //prepare for db work for resource table in mariadb
        try {
            resourceGroupUuid = resourceMassFeed[0].resource_Group_Uuid; 
            const resourceGroupResult: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid); 
            customerAccountKey = resourceGroupResult.customerAccountKey;
            resourceGroupKey = resourceGroupResult.resourceGroupKey;

        } catch(error){
            console.log(error);
            throw error;
        }    

        //pull resource_Target_Uuid from resourceMassFeed
        const itemLength = resourceMassFeed.length;
        const resource_Type = resourceMassFeed[0].resource_Type; 
        for (let i=0; i<itemLength; i++)
        {
            resourceTargetUuidLocal.push(resourceMassFeed[i].resource_Target_Uuid);
        }

        try {
            var updatedCount=0;
            var insertedCount=0;

            await client.connect();            
            const database = client.db("nc_api");
            const resource = database.collection("resource");
            const queryN = {resource_Active: true, resource_Type: resource_Type, resource_Group_Uuid: resourceGroupUuid, resource_Target_Uuid: {$nin: resourceTargetUuidLocal}};

        //change resource= -  resource_Active = false if there is no matched "resource_Target_Uuid" in the database
            const result_delete = await resource.updateMany(queryN, {$set: {resource_Active: false, deleted_At: deleted_At}});
            const deletedInfo = {deletedCount: result_delete.modifiedCount}; 

            console.log (deletedInfo); 
            console.log("query for delete:  ", queryN);
        //update mariadb resource table
            if (result_delete.modifiedCount>0){
                const resource_delete_maria = await this.resourceService.retireResourceByUuidNotIn(resourceTargetUuidLocal, resource_Type, resourceGroupUuid);
                console.log ("db update for Maria: ", resource_delete_maria);
            }

        //up-seart
            for (let i=0; i<itemLength; i++)
            {
                resourceMassFeed[i].updated_At = updated_At;
                resourceMassFeed[i].customer_Account_Key = customerAccountKey;
                resourceMassFeed[i].resource_Group_Key = resourceGroupKey;
                const updateRequest = { resourceTargetUuid:  resourceMassFeed[i].resource_Target_Uuid,
                                        resourceNamespace: resourceMassFeed[i].resource_Namespace,
                                        resourceInstance: resourceMassFeed[i].resource_Instance,
                                        updatedAt: new Date(),
                                        };
                let resourceTargetUuid = resourceMassFeed[i].resource_Target_Uuid;

                var query_search = {resource_Target_Uuid: resourceTargetUuid};
                var query_data = { "$set": resourceMassFeed[i]}; 

                const result_update = await resource.findOneAndUpdate(query_search, query_data);
                console.log ("result_update: ", result_update);
                if (result_update.lastErrorObject.updatedExisting){
                    updatedCount=updatedCount+1;
                // update Mariadb....    
                    const result_update_maria = await this.resourceService.updateResourceByMongoUploader(updateRequest);
                    console.log(result_update_maria); 
                }
                else {
                    resourceMassFeed[i].updated_At = "";
                    resourceMassFeed[i].created_At = created_At;
                    
                    const result_insert= await resource.insertOne(resourceMassFeed[i]);
                    if (result_insert.acknowledged){
                        insertedCount = insertedCount + 1;
                        const result_insert_maria = await this.resourceService.createResourcefromMongoUploader(resourceMassFeed[i], resourceGroupKey);
                        console.log (result_insert_maria); 
                    }
                }
            }
            const updatedInfo = {updatedCount: updatedCount};
            const insertedInfo = {insertedCount: insertedCount};

            console.log("result: ",deletedInfo, updatedInfo, insertedInfo);
            returnResult = {...deletedInfo, ...updatedInfo, ...insertedInfo};

        } catch (err) {
            throw err;
        }
        finally{
            await client.close(); 
        }
        return returnResult;
    } // end of massUploadResourceMongo method      
} // end of massUploaderMongoService class

export default massUploaderMongoService;