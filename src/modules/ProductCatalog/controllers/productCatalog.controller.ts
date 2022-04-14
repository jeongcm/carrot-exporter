import { NextFunction, Request, Response } from 'express';
import { CreateCatalogPlanProductDto, CreateCatalogPlanDto, CreateProductPricingDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
import ProductCatalogService from '@/modules/ProductCatalog/services/productCatalog.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { sys } from 'typescript';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
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


  public createCatalogPlans = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const catalogData: CreateCatalogPlanDto = req.body;
      const { partyId } = req.user;
      const { systemId } = req
      const newCatalogPlan: ICatalogPlan = await this.productCatalogService.createCatalogPlan(catalogData, partyId, systemId);
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
  public updateCatlogPlan = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { params: { catalogPlanId }, body, systemId, user: { partyId } } = req
      const updated: ICatalogPlan = await this.productCatalogService.updateCatalogPlanById(catalogPlanId, body, systemId, partyId);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  }


  public getCatalogPlanProducts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { catalogPlanId } = req.params;
      const allCatalogPlanProducts: ICatalogPlanProduct[] = await this.productCatalogService.getCatalogPlanProducts(catalogPlanId);
      res.status(200).json({ data: allCatalogPlanProducts, message: 'success' });
    } catch (error) {
      next(error);
    }
  };


  public createCatalogPlansProduct = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      let productData: CreateCatalogPlanProductDto = req.body;
      const { user:{partyId}, systemId } = req;
      const catalogPlanDetails: ICatalogPlan = await this.productCatalogService.findCatalogPlan(productData.catalogPlanId);
console.log("catalogPlanDetails", catalogPlanDetails)
      if (!catalogPlanDetails) {
        res.status(409).json({ message: "Catalog Plan  doesn't exist" });

      }
      const newCatalogPlan: ICatalogPlanProduct = await this.productCatalogService.createCatalogPlanProduct(productData, catalogPlanDetails.catalogPlanKey, partyId, systemId);
      res.status(201).json({ data: newCatalogPlan, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getCatalogProductPlanById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const catalogPlanProductId = req.params.catalogPlanProductId;
      const planProduct: ICatalogPlanProduct = await this.productCatalogService.getCatalogPlanProductById(catalogPlanProductId);
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
  public updateCatlogPlanProduct = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { params: { catalogPlanProductId }, body , user:{partyId}, systemId} = req
      const updated: ICatalogPlanProduct = await this.productCatalogService.updateCatalagPlanProduct(catalogPlanProductId, body, partyId, systemId);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  }


  public createPlanProductPricing = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const pricingData: CreateProductPricingDto = req.body;
      const {systemId, user:{partyId}} = req;
      const planProductDetails: ICatalogPlanProduct = await this.productCatalogService.getCatalogPlanProductById(pricingData.catalogPlanProductId);

      if (!planProductDetails) {
        res.status(409).json({ message: "Catalog Plan Product  doesn't exist" });

      }
      const newPricingData: ICatalogPlanProductPrice = await this.productCatalogService.createProductPricing(pricingData, planProductDetails.catalogPlanProductKey, partyId, systemId);
      res.status(201).json({ data: newPricingData, message: 'success' });
    } catch (error) {
      next(error);
    }
  };


}

export default ProductCatalogController;
