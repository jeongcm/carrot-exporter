import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { ResourceDto } from '../dtos/resource.dto';
import ResourceController from '../controllers/resource.controller';

class ResourceRoute implements Routes {
    public router = Router();
    public apiController = new ResourceController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/resource', authMiddleware, validationMiddleware(ResourceDto, 'body'), this.apiController.createResource);
        this.router.get('/resource', authMiddleware, this.apiController.getAllResource);
        this.router.get('/resource/:resourceId', authMiddleware, this.apiController.getResourceById);
        this.router.put('/resource/:resourceId', authMiddleware, validationMiddleware(ResourceDto, 'body'), this.apiController.updateResourceById);
    }
}

export default ResourceRoute;