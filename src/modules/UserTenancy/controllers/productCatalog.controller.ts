import { NextFunction, Request, Response } from 'express';
import { CreateCatalogPlanProductDto, CreateCatalogPlanDto, CreateProductPricingDto } from '@/modules/UserTenancy/dtos/productCatalog.dto';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
import ProductCatalogService from '@/modules/UserTenancy/services/productCatalog.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
class ProductCatalogController {
  public productCatalogService = new ProductCatalogService();


  public getCatalogPlans = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const allCatalogPlans: ICatalogPlan[] = await this.productCatalogService.findAllCatalogPlans();
      res.status(200).json({ data: allCatalogPlans, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };


  public createCatalogPlans = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const catalogData: CreateCatalogPlanDto = req.body;
      const newCatalogPlan: CreateCatalogPlanDto = await this.productCatalogService.createCatalogPlan(catalogData);
      res.status(201).json({ data: newCatalogPlan, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getCatalogPlanById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const catalogPlanId = req.params.catalogPlanId;
      const catalogPlan: ICatalogPlan = await this.productCatalogService.findCatalogPlan(catalogPlanId);
      res.status(200).json({ data: catalogPlan, message: 'finOne' });
    } catch (error) {
      next(error);
    }
  };


 /**
  * {updateCatlogPlan} update the catalog Plan
  * @param req 
  * @param res 
  * @param next 
  */
  public updateCatlogPlan = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { params: { catalogPlanId }, body } = req
      const updated: ICatalogPlan = await this.productCatalogService.updateCatalogPlanById(catalogPlanId, body, req.user.pk);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  }


  public getCatalogPlanProducts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {catalogPlanId} = req.params;
      const allCatalogPlanProducts: ICatalogPlanProduct[] = await this.productCatalogService.getCatalogPlanProducts(catalogPlanId);
      res.status(200).json({ data: allCatalogPlanProducts, message: 'success' });
    } catch (error) {
      next(error);
    }
  };


  public createCatalogPlansProduct = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const productData: CreateCatalogPlanProductDto = req.body;
      const newCatalogPlan: ICatalogPlanProduct = await this.productCatalogService.createCatalogPlanProduct(productData);
      res.status(201).json({ data: newCatalogPlan, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getCatalogProductPlanById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const catalogPlanProductId = req.params.catalogPlanProductId;
      const planProduct: ICatalogPlanProduct = await this.productCatalogService.getCalogPlanProductById(catalogPlanProductId);
      res.status(200).json({ data: planProduct, message: 'success' });
    } catch (error) {
      next(error);
    }
  };


 /**
  * {updateCatlogPlan} update the catalog Plan product
  * @param req 
  * @param res 
  * @param next 
  */
  public updateCatlogPlanProduct = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { params: { catalogPlanProductId }, body } = req
      const updated: ICatalogPlanProduct = await this.productCatalogService.updateCatalagPlanProduct(catalogPlanProductId, body);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  }


  public createPlanProductPricing = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const pricingData: CreateProductPricingDto = req.body;
      const newPricingData: ICatalogPlanProductPrice = await this.productCatalogService.createProductPricing(pricingData);
      res.status(201).json({ data: newPricingData, message: 'success' });
    } catch (error) {
      next(error);
    }
  };


}

export default ProductCatalogController;
