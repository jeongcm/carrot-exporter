import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ProductCatalogController from '@/modules/ProductCatalog/controllers/productCatalog.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CreateCatalogPlanDto, CreateCatalogPlanProductDto, CreateProductPricingDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class ProductCatalogRoute implements Routes {
  public router = Router();
  public productCatalogController = new ProductCatalogController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/catalogPlan', validationMiddleware(CreateCatalogPlanDto, 'body'), this.productCatalogController.createCatalogPlans);
    this.router.get('/catalogPlans', this.productCatalogController.getCatalogPlans);
    this.router.get('/catalogPlan/:catalogPlanId', authMiddleware, this.productCatalogController.getCatalogPlanById);
    this.router.put('/catalogPlan/:catalogPlanId', systemAuthMiddleware, authMiddleware, validationMiddleware(CreateCatalogPlanDto, 'body'), this.productCatalogController.updateCatlogPlan);
    // this.router.get('/catalogPlanProduct/:catalogPlanId',authMiddleware, this.productCatalogController.getCatalogPlanProducts);
    this.router.post('/catalogPlanProduct', systemAuthMiddleware, authMiddleware, validationMiddleware(CreateCatalogPlanProductDto, 'body'), this.productCatalogController.createCatalogPlansProduct);
    this.router.get('/catalogPlanProduct/:catalogPlanProductId', authMiddleware, this.productCatalogController.getCatalogProductPlanById);
    this.router.put('/catalogPlanProduct/:catalogPlanProductId',systemAuthMiddleware , authMiddleware, this.productCatalogController.updateCatlogPlanProduct);
    this.router.post('/productPricing', systemAuthMiddleware, authMiddleware, validationMiddleware(CreateProductPricingDto, 'body'), this.productCatalogController.createPlanProductPricing);
  }
}

export default ProductCatalogRoute;