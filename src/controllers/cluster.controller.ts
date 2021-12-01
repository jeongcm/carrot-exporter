import { NextFunction, Request, Response } from 'express';
import { CreateClusterDto } from '@dtos/cluster.dto';
import { IClusterAdd as Cluster } from '@interfaces/cluster.interface';
import ClusterService from '@services/cluster.service';

class ClusterController {
    public clusterService = new ClusterService();

    public getAllClusters = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const findAllClustersData: Cluster[] = await this.clusterService.findAllCluster();
        res.status(200).json({ data: findAllClustersData, message: 'findAll' });
      } catch (error) {
        next(error);
      }
    };
  
    public getClusterById = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.params.id;
        const findOneUserData: Cluster = await this.clusterService.findClusterById(userId);
        res.status(200).json({ data: findOneUserData, message: 'findOne' });
      } catch (error) {
        next(error);
      }
    };
  
    public createCluster = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clusterData: CreateClusterDto = req.body;
        const createClusterData: Cluster = await this.clusterService.createCluster(clusterData);
        res.status(201).json({ data: createClusterData, message: 'created' });
        
      } catch (error) {
        next(error);
      }
    };
  
    public updateCluster = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clusterId = req.params.id;
        const clusterData = req.body;
        const updateClusterData: Cluster = await this.clusterService.updateCluster(clusterId, clusterData);
        res.status(200).json({ data: updateClusterData, message: 'updated' });
      } catch (error) {
        next(error);
      }
    };
  
    public deleteCluster = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clusterId = req.params.id;
        const deleteClusterData: Cluster = await this.clusterService.deleteCluster(clusterId);
        res.status(200).json({ data: deleteClusterData, message: 'deleted' });
      } catch (error) {
        next(error);
      }
    };
}

export default ClusterController
