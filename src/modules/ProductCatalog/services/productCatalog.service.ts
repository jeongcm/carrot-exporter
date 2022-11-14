import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
import { CreateCatalogPlanDto, CreateCatalogPlanProductDto, CreateProductPricingDto } from '../dtos/productCatalog.dto';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { CatalogPlanProductModel } from '../models/catalogPlanProduct.model';
import { Op } from 'sequelize';
import { ConsoleSpanExporter } from '@opentelemetry/tracing';
import { ISubscribedProduct, ISubscriptions } from '@/common/interfaces/subscription.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { CatalogPlanProductPriceModel } from '../models/catalogPlanProductPrice.model';

class ProductCatlogService {
  public customerAccount = DB.CustomerAccount;
  public catalogPlan = DB.CatalogPlan;
  public subscription = DB.Subscription;
  public subscribedProduct = DB.SubscribedProduct;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  public catalogPlanProductPrice = DB.CatalogPlanProductPrice;
  public tableIdService = new tableIdService();

  /**
   * @function {findAllCatalogPlans} find the all catalog Data
   * @returns
   */
  public async findAllCatalogPlans(): Promise<ICatalogPlan[]> {
    const catalogPlans: ICatalogPlan[] = await this.catalogPlan.findAll({
      where: { deletedAt: null },
      include: [
        {
          model: CatalogPlanProductModel,
        },
      ],
    });
    return catalogPlans;
  }

  /**
   * @function {createCatalogPlan} create new Catalog plan
   * @param {object} new catalog plan data
   * @returns {object} new catalog plan created
   */
  public async createCatalogPlan(data: CreateCatalogPlanDto, partyId: string, systemId: string): Promise<ICatalogPlan> {
    const catalogPlanId = await this.getTableId('CatalogPlan');
    const createData = {
      ...data,
      catalogPlanId: catalogPlanId,
      createdBy: partyId,
      createdAt: new Date(),
    };
    const newCatalogPlan: ICatalogPlan = await this.catalogPlan.create(createData);
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
      },
      include: [{ model: CatalogPlanProductModel, where: { deletedAt: null } }],
    });
    if (!findCatalogPlan) throw new HttpException(409, 'Catalog Plan Not found');
    return findCatalogPlan;
  }

  /**
   * {findCatalogPlanOnly} find the catalog plan by its catalogPlanId
   * @param {string} id
   * @returns {object} catalog plan object only
   */

  public async findCatalogPlanOnly(id: string): Promise<ICatalogPlan> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid catalog Plan');
    const findCatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({
      where: {
        catalogPlanId: id,
        deletedAt: null,
      },
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
  public async updateCatalogPlanById(
    catalogPlanId: string,
    catalogPlanData: CreateCatalogPlanDto,
    systemId: string,
    partyId: string,
  ): Promise<ICatalogPlan> {
    if (isEmpty(catalogPlanData)) throw new HttpException(400, 'Access Group Data cannot be blank');
    const findCataPlan: ICatalogPlan = await this.catalogPlan.findOne({
      where: { catalogPlanId },
    });

    if (!findCataPlan) throw new HttpException(409, "Access Group doesn't exist");
    const updatedcCtalogPlanData = {
      ...catalogPlanData,
      updatedBy: partyId || systemId,
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
    const catalogPlanProducts: ICatalogPlanProduct[] = await this.catalogPlanProduct.findAll({
      where: {
        catalogPlanKey,
        deletedAt: null,
      },
      attributes: { exclude: ['catalogPlanProductKey', 'deletedAt'] },
    });
    return catalogPlanProducts;
  }

  /**
   * @function {createCatalogPlanProduct} function to create new catalog plan product
   * @param {object} data for new catalogPlan product
   * @returns {object} newly created catalogPlan product
   */

  public async createCatalogPlanProduct(
    newData: CreateCatalogPlanProductDto,
    catalogPlanKey: number,
    partyId: string,
    systemId: string,
  ): Promise<Object> {
    const result = [];
    const catalogPlanProductId = await this.getTableId('CatalogPlanProduct');
    const catalogPlanProductPriceId = await this.getTableId('CatalogPlanProductPrice');
    const {
      catalogPlanProductCurrency,
      catalogPlanProductDescription,
      catalogPlanProductMonthlyPrice,
      catalogPlanProductName,
      catalogPlanProductUOM,
      catalogPlanProductType,
    } = newData;

    const createPlanProduct = {
      catalogPlanProductId,
      catalogPlanKey,
      catalogPlanProductCurrency,
      catalogPlanProductDescription,
      catalogPlanProductMonthlyPrice,
      catalogPlanProductName,
      catalogPlanProductUOM,
      catalogPlanProductType,
      createdBy: partyId || systemId,
    };
    try {
      return await DB.sequelize.transaction(async t => {
        const newCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.create(createPlanProduct, { transaction: t });

        const createPlanProductPrice = {
          catalogPlanProductPriceId,
          catalogPlanProductKey: newCatalogPlanProduct.catalogPlanProductKey,
          catalogPlanProductMonthlyPriceFrom: new Date(),
          catalogPlanProductMonthlyPriceTo: new Date(Date.parse('31 Dec 9999 23:59:59 UTC')),
          catalogPlanProductMonthlyPrice,
          createdAt: new Date(),
          createdBy: partyId || systemId,
        };

        const newCatalogPlanProductPrice: ICatalogPlanProductPrice = await this.catalogPlanProductPrice.create(createPlanProductPrice, {
          transaction: t,
        });
        result.push(newCatalogPlanProduct);
        result.push(newCatalogPlanProductPrice);
        return result;
      });
    } catch (error) {
      throw error;
    }
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
        catalogPlanProductId,
        deletedAt: null,
      },
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

  public async updateCatalagPlanProduct(
    productId: string,
    productData: ICatalogPlanProduct,
    partyId: string,
    systemId: string,
  ): Promise<ICatalogPlanProduct> {
    if (isEmpty(productData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const planProductData: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
      where: { catalogPlanProductId: productId, deletedAt: null },
    });

    if (!planProductData) throw new HttpException(409, "Catalog Plan product doesn't exist");
    const updatedPlanProduct = {
      ...productData,
      updatedAt: new Date(),
      updatedBy: partyId || systemId,
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

  public async createProductPricing(
    pricingData: CreateProductPricingDto,
    catalogPlanProductKey: number,
    partyId: string,
    systemId: string,
  ): Promise<ICatalogPlanProductPrice> {
    const findActivePriceQuery = {
      where: {
        catalogPlanProductKey,
        catalogPlanProductMonthlyPriceTo: {
          [Op.gt]: new Date(),
        },
        deletedAt: null,
      },
    };

    let newData;
    const currentDate = new Date();
    const catalogPlanProductPriceId = await this.getTableId('CatalogPlanProductPrice');
    const { catalogPlanProductMonthlyPrice, catalogPlanProductMonthlyPriceFrom, catalogPlanProductMonthlyPriceTo } = pricingData;
    const catalogPlanProductMonthlyPriceFromString: string = catalogPlanProductMonthlyPriceFrom.toString();
    const dateFrom = Date.parse(catalogPlanProductMonthlyPriceFromString);
    const dateNow = Date.parse(currentDate.toISOString());

    if (dateFrom < dateNow) throw new HttpException(409, 'from date should be future date');

    const createData = {
      catalogPlanProductPriceId,
      catalogPlanProductMonthlyPrice,
      catalogPlanProductMonthlyPriceFrom,
      catalogPlanProductMonthlyPriceTo,
      catalogPlanProductKey,
      createdBy: partyId || systemId,
    };

    const findActiveCatalogPlanProduct: ICatalogPlanProductPrice[] = await this.catalogPlanProductPrice.findAll(findActivePriceQuery);
    if (!findActiveCatalogPlanProduct) {
      newData = await this.catalogPlanProductPrice.create(createData);
    } else {
      const planProductPriceKey = findActiveCatalogPlanProduct.map(x => x.catalogPlanProductPriceKey);

      const updateCatalogPlanProduct = await this.catalogPlanProductPrice.update(
        { deletedAt: currentDate, catalogPlanProductMonthlyPriceTo: catalogPlanProductMonthlyPriceFrom },
        { where: { catalogPlanProductPriceKey: planProductPriceKey } },
      );
      newData = await this.catalogPlanProductPrice.create(createData);
    }

    return newData;
  }

  public getTableId = async (tableIdTableName: string) => {
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

    if (!tableId) {
      return;
    }
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    return responseTableIdData.tableIdFinalIssued;
  };

  /**
   * @function  {deleteCatalogPlanById} delete catalog Plan Data using id
   * @param  {string} catalogPlanProductId
   * @param  {number} partyId
   * @returns Promise<catalogPlan>
   */
  public async deleteCatalogPlanProductById(catalogPlanProductId: string, partyId: string): Promise<Object> {
    if (isEmpty(catalogPlanProductId)) throw new HttpException(400, 'CatalogPlaProductId is null');
    const findCataPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
      where: { catalogPlanProductId, deletedAt: null },
    });

    if (!findCataPlanProduct) throw new HttpException(404, "Catalog Plan Product doesn't exist");
    const catalogPlanProductKey = findCataPlanProduct.catalogPlanProductKey;
    console.log('catalogPlanProductKey', catalogPlanProductKey);

    const findSubscribedProduct: ISubscribedProduct[] = await this.subscribedProduct.findAll({ where: { catalogPlanProductKey, deletedAt: null } });
    console.log('findSubscribedProduct', findSubscribedProduct);
    if (findSubscribedProduct.length > 0) throw new HttpException(409, 'Active Subscriptions under product');

    const updatedcCtalogPlanData = {
      updatedBy: partyId,
      updatedAt: new Date(),
      deletedAt: new Date(),
    };

    await this.catalogPlanProduct.update(updatedcCtalogPlanData, { where: { catalogPlanProductId } });

    const updateData = { deletedCatalogPlanProduct: catalogPlanProductId };

    return updateData;
  }

  public async getAvailableCatalogPlans(customerAccountKey: number): Promise<ICatalogPlan[]> {
    const returnPlan = [];
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountKey, deletedAt: null } });
    if (!findCustomerAccount) throw new HttpException(404, 'Cannot find customer account');

    const findSubscription: ISubscriptions[] = await this.subscription.findAll({ where: { customerAccountKey, deletedAt: null } });
    if (findSubscription.length == 0) {
      const findCatalogPlan: ICatalogPlan[] = await this.catalogPlan.findAll({
        where: { deletedAt: null },
        include: [
          {
            model: CatalogPlanProductModel,
            where: { deletedAt: null },
            include: [{ model: CatalogPlanProductPriceModel, where: { deletedAt: null } }],
          },
        ],
      });
      returnPlan.push(findCatalogPlan);
    } else {
      const catalogPlanKey = findSubscription.map(x => x.catalogPlanKey);
      console.log(catalogPlanKey);
      const findCatalogPlan: ICatalogPlan[] = await this.catalogPlan.findAll({
        where: { deletedAt: null, catalogPlanKey: { [Op.notIn]: catalogPlanKey } },
        include: [
          {
            model: CatalogPlanProductModel,
            where: { deletedAt: null },
            include: [{ model: CatalogPlanProductPriceModel, where: { deletedAt: null } }],
          },
        ],
      });
      returnPlan.push(findCatalogPlan);
    }

    return returnPlan;
  }
}

export default ProductCatlogService;
