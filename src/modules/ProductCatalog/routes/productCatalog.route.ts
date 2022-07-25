import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ProductCatalogController from '@/modules/ProductCatalog/controllers/productCatalog.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CreateCatalogPlanDto, CreateCatalogPlanProductDto, CreateProductPricingDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class ProductCatalogRoute implements Routes {
  public router = Router();
  public productCatalogController = new ProductCatalogController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/catalogPlan',
      authMiddleware,
      validationMiddleware(CreateCatalogPlanDto, 'body'),
      createUserLogMiddleware,
      this.productCatalogController.createCatalogPlans,
    );
    this.router.get('/catalogPlans', systemAuthMiddleware, this.productCatalogController.getCatalogPlans);
    this.router.get('/catalogPlan/:catalogPlanId', systemAuthMiddleware, this.productCatalogController.getCatalogPlanById);
    this.router.put(
      '/catalogPlan/:catalogPlanId',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(CreateCatalogPlanDto, 'body'),
      createUserLogMiddleware,
      this.productCatalogController.updateCatlogPlan,
    );
    // this.router.get('/catalogPlanProduct/:catalogPlanId',authMiddleware, this.productCatalogController.getCatalogPlanProducts);
    this.router.post(
      '/catalogPlanProduct',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(CreateCatalogPlanProductDto, 'body'),
      createUserLogMiddleware,
      this.productCatalogController.createCatalogPlansProduct,
    );
    this.router.get(
      '/catalogPlanProduct/:catalogPlanProductId',
      authMiddleware,
      createUserLogMiddleware,
      this.productCatalogController.getCatalogProductPlanById,
    );
    this.router.put(
      '/catalogPlanProduct/:catalogPlanProductId',
      systemAuthMiddleware,
      authMiddleware,
      createUserLogMiddleware,
      this.productCatalogController.updateCatlogPlanProduct,
    );
    this.router.post(
      '/productPricing',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(CreateProductPricingDto, 'body'),
      createUserLogMiddleware,
      this.productCatalogController.createPlanProductPricing,
    );
  }
}

export default ProductCatalogRoute;
