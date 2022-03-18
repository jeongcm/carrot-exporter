import { Router } from 'express';
import ClusterController from '@/modules/K8s/controllers/cluster.controller';
import { CreateClusterDto } from '@/modules/K8s/dtos/cluster.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';


class UsersRoute implements Routes {
  public router = Router();
  public clusterController = new ClusterController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/clusters',
      authMiddleware,
      validationMiddleware(CreateClusterDto, 'body'),
      this.clusterController.createCluster,
    );
    this.router.get('/clusters', authMiddleware, this.clusterController.getAllClusters);
    this.router.get('/clusters/:id', authMiddleware, this.clusterController.getClusterById);
    this.router.delete('/clusters/:id', authMiddleware, this.clusterController.deleteCluster);
    this.router.put('/clusters/:id', authMiddleware, this.clusterController.updateCluster);
  }
}

export default UsersRoute;
