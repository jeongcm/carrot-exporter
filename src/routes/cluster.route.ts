import { Router } from 'express';
import ClusterController from '@controllers/cluster.controller';
import { CreateClusterDto } from '@dtos/cluster.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';

class UsersRoute implements Routes {
  public router = Router();
  public clusterController = new ClusterController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get( '/clusters', this.clusterController.getUserClusters);
    this.router.post(
      '/clusters',
      this.authservice.authenticate,
      validationMiddleware(CreateClusterDto, 'body'),
      this.clusterController.createCluster,
    );
    this.router.get('/clusters', this.authservice.authenticate, this.clusterController.getAllClusters);
    this.router.get('/clusters/:id', this.authservice.authenticate, this.clusterController.getClusterById);
    this.router.delete('/clusters/:id', this.authservice.authenticate, this.clusterController.deleteCluster);
    this.router.put('/clusters/:id', this.authservice.authenticate, this.clusterController.updateCluster);
  }
}

export default UsersRoute;
