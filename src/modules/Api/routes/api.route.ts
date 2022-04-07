import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { ApiDto } from '../dtos/api.dto';
import ApiController from '../controllers/api.controller';

class ApiRoute implements Routes {
    public router = Router();
    public apiController = new ApiController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/api', authMiddleware, validationMiddleware(ApiDto, 'body'), this.apiController.createApi);
        this.router.get('/api', authMiddleware, this.apiController.getAllApi);
        this.router.get('/api/:apiId', authMiddleware, this.apiController.getApiById);
        this.router.put('/api/:apiId', authMiddleware, validationMiddleware(ApiDto, 'body'), this.apiController.updateApiById);
    }
}

export default ApiRoute;