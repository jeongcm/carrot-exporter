import { MongoClient } from 'mongodb';
import DB from '@/database';
import axios from 'common/httpClient/axios';
import { HttpException } from '@/common/exceptions/HttpException';
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
    let returnResult;
    /*
        //Mongodb access - need to change to make this configurable
        const mongoUrl = config.db.mongodb.url;
        const client = new MongoClient(mongoUrl);

        var customerAccountKey;
        var resourceGroupKey;
        var resourceGroupUuid;
        var resourceTargetUuidLocal = [];
        const deleted_At = new Date().toISOString();
        const created_At = new Date().toISOString();
        const updated_At = new Date().toISOString();
        console.log ("service-resourceMassFeed");
        console.log(resourceMassFeed.resource_Group_Uuid);
        console.log(resourceMassFeed.resource_Type);
        //prepare for db work for resource table in mariadb
        try {
            resourceGroupUuid = resourceMassFeed.resource_Group_Uuid;

            const resourceGroupResult: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
            customerAccountKey = resourceGroupResult.customerAccountKey;
            resourceGroupKey = resourceGroupResult.resourceGroupKey;

        } catch(error){
            console.log(error);
            throw error;
        }

        //pull resource_Target_Uuid from resourceMassFeed
        const itemLength = resourceMassFeed.length;
        const resource_Type = resourceMassFeed.resource_Type;
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
            const queryN = {resourceActive: true, resourceType: resource_Type, resourceGroupUuid: resourceGroupUuid, resourceTargetUuid: {$nin: resourceTargetUuidLocal}};

        //change resource= -  resource_Active = false if there is no matched "resource_Target_Uuid" in the database
            const result_delete = await resource.updateMany(queryN, {$set: {resourceActive: false, deletedAt: deleted_At}});
            const deletedInfo = {deletedCount: result_delete.modifiedCount};

            //console.log (deletedInfo);
            //console.log("query for delete:  ", queryN);
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

                let resourceTargetUuid = resourceMassFeed[i].resource_Target_Uuid;

                var query_search = {resource_Target_Uuid: resourceTargetUuid};
                var query_data = { "$set": resourceMassFeed[i]};


                const result_update = await resource.findOneAndUpdate(query_search, query_data);
                //console.log ("result_update: ", result_update);
                if (result_update.lastErrorObject.updatedExisting){
                    updatedCount=updatedCount+1;
                // update Mariadb....
                    const result_update_maria = await this.resourceService.updateResourceByMongoUploader(resourceMassFeed[i]);
                //    console.log(result_update_maria);
                }
                else {
                    resourceMassFeed[i].updated_At = "";
                    resourceMassFeed[i].created_At = created_At;

                    const result_insert= await resource.insertOne(resourceMassFeed[i]);
                    if (result_insert.acknowledged){
                        insertedCount = insertedCount + 1;
                        const result_insert_maria = await this.resourceService.createResourcefromMongoUploader(resourceMassFeed[i], resourceGroupKey);
                    //    console.log (result_insert_maria);
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
        */
    return returnResult;
  } // end of massUploadResourceMongo method

  public async massUpdoadMetricReceived(metricReceivedMassFeed: string, clusterUuid: string): Promise<object> {
    const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid: clusterUuid },
    });
    if (!resultResourceGroup) {
      throw new HttpException(400, `cluster uuid ${clusterUuid} doesn't exist`);
    }

    const victoriaMetricsAddress = config.victoriaMetrics.NC_LARI_VM_ADDRESS;
    const victoriaMetricsApiImport = config.victoriaMetrics.NC_LARI_VM_API + clusterUuid;
    const apiUrl = victoriaMetricsAddress + victoriaMetricsApiImport;
    let result;

    await axios({
      method: 'post',
      url: `${apiUrl}`,
      data: metricReceivedMassFeed,
    })
      .then(async (res: any) => {
        console.log(`Sucess to call ${apiUrl} for MetricReceived Feed, status code: ${res.status} `);
        result = { 'response code: ': res.status };
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Unknown error to call Victoriametrics api');
      });

    return result;
  }
} // end of massUploaderMongoService class

export default massUploaderMongoService;
