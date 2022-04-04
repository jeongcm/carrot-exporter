import bcrypt from 'bcrypt';
import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import config from 'config';
import urlJoin from 'url-join';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
import { CreateCatalogPlanDto, CreateCatalogPlanProductDto, CreateProductPricingDto } from '../dtos/productCatalog.dto';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

class ProductCatlogService {
  public catalogPlan = DB.CatalogPlan;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  public catalogPlanProductPrice = DB.CatalogPlanProductPrice;
  public tableIdService = new tableIdService();


  /**
   * @function {findAllCatalogPlans} find the all catalog Data
   * @returns 
   */
  public async findAllCatalogPlans(): Promise<ICatalogPlan[]> {
    const catalogPlans: ICatalogPlan[] = await this.catalogPlan.findAll({ where: { deletedAt: null } });
    return catalogPlans;
  }

  /**
   * @function {createCatalogPlan} create new Catalog plan
   * @param {object} new catalog plan data 
   * @returns {object} new catalog plan created
   */
  public async createCatalogPlan(data: CreateCatalogPlanDto): Promise<ICatalogPlan> {
    const catalogPlanId = await this.getTableId('CatalogPlan');
    data = { ...data, catalogPlanId }
    const newCatalogPlan: ICatalogPlan = await this.catalogPlan.create(data);
    return newCatalogPlan;
  }


  /**
   * {findCatalogPlan} find the catalog plan by its catalogPlanId
   * @param {string} id 
   * @returns {object} catalog plan object
   */

  public async findCatalogPlan(id: string): Promise<ICatalogPlan> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid catalog Plan');
    const findCatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({
      where: {
        catalogPlanId: id,
        deletedAt: null,
      }
    });
    if (!findCatalogPlan) throw new HttpException(409, 'Catalog Plan Not found');
    return findCatalogPlan;
  }


  /**
   * @function  {updateCatalogPlanById} update catalog Plan Data using id
   * @param  {string} catalogPlanId
   * @param  {number} currentUserPk
   * @returns Promise<catalogPlan>
   */
  public async updateCatalogPlanById(catalogPlanId: string, catalogPlanData: CreateCatalogPlanDto, currentUserPk: number): Promise<ICatalogPlan> {
    if (isEmpty(catalogPlanData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const findCataPlan: ICatalogPlan = await this.catalogPlan.findOne({ where: { catalogPlanId } });

    if (!findCataPlan) throw new HttpException(409, "Access Group doesn't exist");
    const updatedcCtalogPlanData = {
      ...catalogPlanData,
      updatedBy: 'system',
      updatedAt: new Date(),
    };

    await this.catalogPlan.update(updatedcCtalogPlanData, { where: { catalogPlanId } });

    const updateData: ICatalogPlan = await this.catalogPlan.findByPk(findCataPlan.catalogPlanKey);

    return updateData;
  }

  /**
   * @function {getCatalogPlanProducts} get all  catalog plan product of a particular plan
   * @param {string} catalogPlanKey 
   * @returns array of catalog plan product of a particular plan
   */
  public async getCatalogPlanProducts(catalogPlanKey: string): Promise<ICatalogPlanProduct[]> {
    const catalogPlanProducts: ICatalogPlanProduct[] = await this.catalogPlanProduct.findAll(
      {
        where:
        {
          catalogPlanKey
        }
        , attributes: { exclude: ['catalogPlanProductKey', 'deletedAt'] }
      });
    return catalogPlanProducts;
  }

  /**
   * @function {createCatalogPlanProduct} function to create new catalog plan product
   * @param {object} data for new catalogPlan product
   * @returns {object} newly created catalogPlan product
   */

  public async createCatalogPlanProduct(newData: CreateCatalogPlanProductDto, catalogPlanKey: number): Promise<ICatalogPlanProduct> {
    const catalogPlanProductId = await this.getTableId('CatalogPlanProduct');
    const {
      catalogPlanProductCurrency,
      catalogPlanProductDescription,
      catalogPlanProductMonthlyPrice,
      catalogPlanProductName,
      catalogPlanProductUOM
    } = newData
    let createData = {
      catalogPlanProductId,
      catalogPlanKey,
      catalogPlanProductCurrency,
      catalogPlanProductDescription,
      catalogPlanProductMonthlyPrice,
      catalogPlanProductName,
      catalogPlanProductUOM
    }
    const newCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.create(createData);
    return newCatalogPlanProduct;
  }

  /**
   * @function getCalogPlanProductById catalogPlanProduct details by id
   * @param catalogPlanProductId 
   * @returns {object} deatils of catalog plan Product Data
   */
  public async getCatalogPlanProductById(catalogPlanProductId: string): Promise<ICatalogPlanProduct> {
    if (isEmpty(catalogPlanProductId)) throw new HttpException(400, 'Not a valid catalog Plan');
    const findCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
      where: {
        catalogPlanProductId
      }
    });
    if (!findCatalogPlanProduct) throw new HttpException(409, `Catalog Plan product  Not found `);
    return findCatalogPlanProduct;
  }


  /**
   * @function updateCatalagPlanProduct for updating the plan product
   * @param {object} productData 
   * @param {string} productId 
   * @returns  {object}
   */

  public async updateCatalagPlanProduct(productId: string, productData: ICatalogPlanProduct): Promise<ICatalogPlanProduct> {
    if (isEmpty(productData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const planProductData: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({ where: { catalogPlanProductId: productId, deletedAt: false } });

    if (!planProductData) throw new HttpException(409, "Access Group doesn't exist");
    const updatedPlanProduct = {
      ...productData,
      updatedAt: new Date(),
    };

    await this.catalogPlanProduct.update(updatedPlanProduct, { where: { catalogPlanProductId: productId } });
    const updateData: ICatalogPlanProduct = await this.catalogPlanProduct.findByPk(planProductData.catalogPlanProductKey);
    return updateData;
  }



  /**
   * @function createProductPricing 
   * @param {object} pricingData 
   * @returns {object} ICatalogPlanProductPrice
   */

  public async createProductPricing(pricingData: CreateProductPricingDto, catalogPlanProductKey: number): Promise<ICatalogPlanProductPrice> {
    const catalogPlanProductPricingId = await this.getTableId('CatalogPlanProductPrice');
    const {
      catalogPlanProductMonthlyPrice,
      catalogPlanProductMonthlyPriceFrom,
      catalogPlanProductMonthlyPriceTo
    } = pricingData

    let createData = {
      catalogPlanProductPricingId,
      catalogPlanProductMonthlyPrice,
      catalogPlanProductMonthlyPriceFrom,
      catalogPlanProductMonthlyPriceTo,
      catalogPlanProductKey
    }
    pricingData = { ...pricingData, catalogPlanProductPricingId }
    const newData: ICatalogPlanProductPrice = await this.catalogPlanProductPrice.create(createData);
    return newData
  }




  public getTableId = async (tableIdTableName: string) => {
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

    if (!tableId) {
      return;
    }
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    return responseTableIdData.tableIdFinalIssued;
  }


}

export default ProductCatlogService;
