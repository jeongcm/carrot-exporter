import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ExecutorDto, IExecutorClient } from '@/modules/CommonService/dtos/executor.dto';
import executorService from '../services/executor.service';


class executorController{

    public executorService = new executorService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */    
    public checkExecutorResourceResponse = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const serviceUuid = req.params.serviceUuid;

            const executorServiceResult = await this.executorService.checkExecutorResourceResponse(serviceUuid);
            if (!executorServiceResult) {
                return res.sendStatus(404);
            }
            if (executorServiceResult.serviceUuid) {
                res.status(200).json({ data: executorServiceResult, message: `well received the service execution result of service uuid: ${serviceUuid}` });
            } else {
                res.status(200).json({ data: executorServiceResult, message: `waiting for service execution result of service uuid: ${serviceUuid}` });
            }    

        } catch (error) {
            next(error);
        }
    }; // end of method

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
    public checkExecutorResponse = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const serviceUuid = req.params.serviceUuid;

            const executorServiceResult = await this.executorService.checkExecutorResponse(serviceUuid);
            if (!executorServiceResult) {
                return res.sendStatus(404);
            }
            if (executorServiceResult.serviceUuid) {
                res.status(200).json({ data: executorServiceResult, message: `well received the service execution result of service uuid: ${serviceUuid}` });
            } else {
                res.status(200).json({ data: executorServiceResult, message: `waiting for service execution result of service uuid: ${serviceUuid}` });
            }    

        } catch (error) {
            next(error);
        }
    }; // end of method

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
   public registerExecutorClient = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
      
    const requestExecutorClient: ExecutorDto= req.body;
    const resourceGroupName = req.body.resourceGroupName;
    const currentUserId = req.user.partyId;

    try {
      const executorClient: IExecutorClient = await this.executorService.registerExecutorClient(requestExecutorClient, currentUserId );
      res.status(200).json({ data: executorClient, message: `create executor for cluster(${resourceGroupName}) ` });
    } catch (error) {
      next(error);
    }
  };


    /**
     * @param  {IRequestWithUser} req
     * @param  {Response} res
     * @param  {NextFunction} next
     */
    public checkExecutorClient = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
        const clusterUuid = req.params.clusterUuid;

        const clientUuid: string = await this.executorService.checkExecutorClient(
        clusterUuid
        );
        if (clientUuid){    
        res.status(200).json({ clientUuid: clientUuid, message: `Success to confirm Executor/Sudory client: clientUuid: ${clientUuid}` });
        }
        else {
        res.status(404).json({ clientUuid: clientUuid, message: `Executor/Sudory client not found` }); 
        }  
    } catch (error) {
        next(error);
    }
    };

    /**
     * @param  {IRequestWithUser} req
     * @param  {Response} res
     * @param  {NextFunction} next
     */
    public installKpsOnResourceGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
        const clusterUuid = req.body.clusterUuid;
        const targetNamespace = req.body.targetNamespace;
        const systemId = req.systemId; 
        
        const serviceUuid: string = await this.executorService.installKpsOnResourceGroup(
        clusterUuid, targetNamespace, systemId
        );
        res.status(200).json({ serviceUuid: serviceUuid, message: `Successfullyt submit kps stack installation service request on cluserUuid: ${clusterUuid}` });

    } catch (error) {
        next(error);
    }
    };

    /**
     * @param  {IRequestWithUser} req
     * @param  {Response} res
     * @param  {NextFunction} next
     */
     public requestResourceToExecutor = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const clusterUuid = req.body.clusterUuid; 
            const targetNamespace = req.body.targetNamespace;
            const resourceType = req.body.resourceType;
            const name = req.body.name;
            const labels = req.body.labels;
            
            const requestDataset = {clusterUuid: clusterUuid,
                                    targetNamespace: targetNamespace, 
                                    resourceType: resourceType,
                                    name: name,
                                    labels: labels}; 

            const serviceUuid: string = await this.executorService.requestResourceToExecutor(requestDataset);
            res.status(200).json({ serviceUuid: serviceUuid, message: `Successfullyt submit k8s resource list service request on cluserUuid: ${clusterUuid}` });
    
        } catch (error) {
            next(error);
        }
        };

    /**
     * @param  {IRequestWithUser} req
     * @param  {Response} res
     * @param  {NextFunction} next
     */
     public scheduleMetricMeta = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const clusterUuid = req.body.clusterUuid; 
            //const targetNamespace = req.body.targetNamespace;
            
            const cronJobResult: object = await this.executorService.scheduleMetricMeta(clusterUuid);
            res.status(200).json({ cronJobResult: cronJobResult, message: `Successfullyt schedule metric meta job` });
    
        } catch (error) {
            next(error);
        }
        };

    /**
     * @param  {IRequestWithUser} req
     * @param  {Response} res
     * @param  {NextFunction} next
     */
     public scheduleResource = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const clusterUuid = req.body.clusterUuid; 
            const resourceType = req.body.resourceType;
            
            const cronJobResult: object = await this.executorService.scheduleResource(clusterUuid, resourceType);
            res.status(200).json({ cronJobResult: cronJobResult, message: `Successfullyt schedule resource interfaces` });
    
        } catch (error) {
            next(error);
        }
        };



        


} // end of class

export default executorController;