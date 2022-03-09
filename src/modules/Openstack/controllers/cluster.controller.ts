import { NextFunction, Response } from 'express';
import { CreateClusterDto } from '@/modules/K8s/dtos/cluster.dto';
import { IClusterAdd as Cluster } from '@/common/interfaces/cluster.interface';
import ClusterService from '@/modules/K8s/services/cluster.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

class ClusterController {
  public clusterService = new ClusterService();

  public getAllClusters = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllClustersData: Cluster[] = await this.clusterService.findAllCluster();
      res.status(200).json({ data: findAllClustersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getClusterById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userPk = req.params.id;
      const findOneUserData: Cluster = await this.clusterService.findClusterById(userPk);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createCluster = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterData: CreateClusterDto = req.body;
      const createClusterData: Cluster = await this.clusterService.createCluster(clusterData);
      res.status(201).json({ data: createClusterData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateCluster = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterPk = req.params.id;
      const clusterData = req.body;
      const updateClusterData: Cluster = await this.clusterService.updateCluster(clusterPk, clusterData);
      res.status(200).json({ data: updateClusterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteCluster = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterPk = req.params.id;
      const deleteClusterData: Cluster = await this.clusterService.deleteCluster(clusterPk);
      res.status(200).json({ data: deleteClusterData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default ClusterController;
