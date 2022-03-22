import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/modules/UserTenancy/dtos/user.dto';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
import ProductCatalogService from '@/modules/UserTenancy/services/productCatalog.service';
class ProductCatalogController {
  public productCatalogService = new ProductCatalogService();
}

export default ProductCatalogController;
