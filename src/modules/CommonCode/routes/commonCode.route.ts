import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import CommonCodeController from '../controllers/commonCode.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CommonCodeDto } from '../dtos/commonCode.dto';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class CommonCodeRoute implements Routes {
    public router = Router();
    public commonCodeController = new CommonCodeController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/commonCode', authMiddleware, validationMiddleware(CommonCodeDto, 'body'), this.commonCodeController.createCommonCode);
        this.router.get('/commonCode', authMiddleware, this.commonCodeController.getAllCommonCode);
        this.router.get('/commonCode/:id', authMiddleware, this.commonCodeController.getCommonCode);
        this.router.put('/commonCode/:id', authMiddleware, validationMiddleware(CommonCodeDto, 'body'), this.commonCodeController.updateCommonCode);
    }
}

export default CommonCodeRoute;
