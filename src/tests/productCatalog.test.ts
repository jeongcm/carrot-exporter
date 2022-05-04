import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});


describe('Testing ProductCatalog Module', () => {
  let productCatalogRoute,catalogPlan,   catalogPlanId, token, catalogPlanProductId, catalogPlanProductDB;

  beforeAll(async () => {
    productCatalogRoute = new ProductCatalogRoute();
    let partRoute = new PartyRoute()
    catalogPlan = productCatalogRoute.productCatalogController.productCatalogService.catalogPlan;
    catalogPlanProductDB = productCatalogRoute.productCatalogController.productCatalogService.catalogPlanProduct;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      "userId": "shrishti.raj@gmail.com",
      "password": "Password@123!"
    })

    token = res.body.token; // save the token!

  });
  describe('[POST] /catalogPlan - create new catalog plan', () => {

    it('return 200 with new plan detail', async () => {

      const requestPayload = {
        "catalogPlanName": "shrishti catalog 2",
        "catalogPlanDescription": "this catalog plan id for development purpose",
        "catalogPlanType": "OB"
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);
      catalogPlan.create = jest.fn().mockReturnValue({ ...requestPayload, catalogPlanKey: 121336 });
      const res = await request(app.getServer()).post('/catalogPlan').send(requestPayload)
        .set('x-authorization', `Bearer ${token}`)

      expect(res.statusCode).toEqual(201)
      catalogPlanId = res.body.data.catalogPlanId

      // expect(res.body).toHaveProperty('post')
    })
    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        "catalogPlanName": "shrishti catalog 2",
        "catalogPlanDescription": "this catalog plan id for development purpose",
        "catalogPlanType": "OB"
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);
      catalogPlan.create = jest.fn().mockReturnValue({ ...requestPayload, catalogPlanKey: 121336 });
      const res = await request(app.getServer()).post('/catalogPlan').send(requestPayload)

      expect(res.statusCode).toEqual(401)
    })

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        "catalogPlanName": "shrishti catalog 2",
        "catalogPlanDescription": "this catalog plan id for development purpose",
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);
      catalogPlan.create = jest.fn().mockReturnValue({ ...requestPayload, catalogPlanKey: 121336 });
      const res = await request(app.getServer()).post('/catalogPlan').send(requestPayload).set('x-authorization', `Bearer ${token}`)

      expect(res.statusCode).toEqual(400)
    })
  })

  describe('[GET] /catalogPlans - All catalog plans', () => {
    it('returns 200 with found all catalogPlans', async () => {
      catalogPlan.findAll = jest.fn().mockReturnValue([
        {
            "catalogPlanKey": 2,
            "catalogPlanId": "CT24060300000006",
            "catalogPlanName": "shrishti catalog 1 update",
            "catalogPlanDescription": "this catalog plan id=s for development purpose",
            "catalogPlanType": "MO",
            "deletedAt": null,
            "createdBy": "PU24053000000003",
            "updatedBy": "PU24053000000003",
            "createdAt": "2022-05-02T05:01:24.000Z",
            "updatedAt": "2022-05-02T05:01:24.000Z",
            "CatalogPlanProducts": [
                {
                    "catalogPlanProductKey": 1,
                    "catalogPlanProductId": "CP24060300000001",
                    "catalogPlanKey": 2,
                    "catalogPlanProductName": "catalog plan product shrishti 4",
                    "catalogPlanProductDescription": "this is dev phase",
                    "catalogPlanProductMonthlyPrice": 30,
                    "catalogPlanProductUOM": "EA",
                    "catalogPlanProductCurrency": "US",
                    "catalogPlanProductType": "ON",
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T06:12:15.000Z",
                    "updatedAt": "2022-05-02T06:12:15.000Z",
                    "deletedAt": null,
                    "catalog_plan_key": 2
                },
                {
                    "catalogPlanProductKey": 2,
                    "catalogPlanProductId": "CP24060300000002",
                    "catalogPlanKey": 2,
                    "catalogPlanProductName": "catalog plan product shrishti 4",
                    "catalogPlanProductDescription": "this is dev phase",
                    "catalogPlanProductMonthlyPrice": 30,
                    "catalogPlanProductUOM": "EA",
                    "catalogPlanProductCurrency": "US",
                    "catalogPlanProductType": "ON",
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T06:13:42.000Z",
                    "updatedAt": "2022-05-02T06:13:42.000Z",
                    "deletedAt": null,
                    "catalog_plan_key": 2
                }
            ]
        },
        {
            "catalogPlanKey": 1,
            "catalogPlanId": "CT24053000000001",
            "catalogPlanName": "shrishti catalog 2",
            "catalogPlanDescription": "this catalog plan id=s for development purpose",
            "catalogPlanType": "OB",
            "deletedAt": null,
            "createdBy": "PU24053000000003",
            "updatedBy": "PU24053000000003",
            "createdAt": "2022-04-29T04:23:55.000Z",
            "updatedAt": "2022-04-29T04:23:55.000Z",
            "CatalogPlanProducts": []
        }]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);

      const res = await request(app.getServer()).get('/catalogPlans').send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
      expect(res.statusCode).toEqual(200)
      

    })
    it('returns 401  unAuthorized', async () => {
      catalogPlan.findAll = jest.fn().mockReturnValue([
        {
            "catalogPlanKey": 2,
            "catalogPlanId": "CT24060300000006",
            "catalogPlanName": "shrishti catalog 1 update",
            "catalogPlanDescription": "this catalog plan id=s for development purpose",
            "catalogPlanType": "MO",
            "deletedAt": null,
            "createdBy": "PU24053000000003",
            "updatedBy": "PU24053000000003",
            "createdAt": "2022-05-02T05:01:24.000Z",
            "updatedAt": "2022-05-02T05:01:24.000Z",
            "CatalogPlanProducts": [
                {
                    "catalogPlanProductKey": 1,
                    "catalogPlanProductId": "CP24060300000001",
                    "catalogPlanKey": 2,
                    "catalogPlanProductName": "catalog plan product shrishti 4",
                    "catalogPlanProductDescription": "this is dev phase",
                    "catalogPlanProductMonthlyPrice": 30,
                    "catalogPlanProductUOM": "EA",
                    "catalogPlanProductCurrency": "US",
                    "catalogPlanProductType": "ON",
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T06:12:15.000Z",
                    "updatedAt": "2022-05-02T06:12:15.000Z",
                    "deletedAt": null,
                    "catalog_plan_key": 2
                },
                {
                    "catalogPlanProductKey": 2,
                    "catalogPlanProductId": "CP24060300000002",
                    "catalogPlanKey": 2,
                    "catalogPlanProductName": "catalog plan product shrishti 4",
                    "catalogPlanProductDescription": "this is dev phase",
                    "catalogPlanProductMonthlyPrice": 30,
                    "catalogPlanProductUOM": "EA",
                    "catalogPlanProductCurrency": "US",
                    "catalogPlanProductType": "ON",
                    "createdBy": "PU24053000000003",
                    "updatedBy": "PU24053000000003",
                    "createdAt": "2022-05-02T06:13:42.000Z",
                    "updatedAt": "2022-05-02T06:13:42.000Z",
                    "deletedAt": null,
                    "catalog_plan_key": 2
                }
            ]
        },
        {
            "catalogPlanKey": 1,
            "catalogPlanId": "CT24053000000001",
            "catalogPlanName": "shrishti catalog 2",
            "catalogPlanDescription": "this catalog plan id=s for development purpose",
            "catalogPlanType": "OB",
            "deletedAt": null,
            "createdBy": "PU24053000000003",
            "updatedBy": "PU24053000000003",
            "createdAt": "2022-04-29T04:23:55.000Z",
            "updatedAt": "2022-04-29T04:23:55.000Z",
            "CatalogPlanProducts": []
        }]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);

      const res = await request(app.getServer()).get('/catalogPlans').send()
      expect(res.statusCode).toEqual(401)
      

    })
  })
  describe('[GET] /catalogPlan/:catalogPlanId -get  catalog plan by id', () => {
    it('should return 200  with  catlogPlan by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);
      catalogPlan.findOne = jest.fn().mockReturnValue({
        "catalogPlanKey": 2,
        "catalogPlanId": "CT24060300000006",
        "catalogPlanName": "shrishti catalog 1 update",
        "catalogPlanDescription": "this catalog plan id=s for development purpose",
        "catalogPlanType": "MO",
        "deletedAt": null,
        "createdBy": "PU24053000000003",
        "updatedBy": "PU24053000000003",
        "createdAt": "2022-05-02T05:01:24.000Z",
        "updatedAt": "2022-05-02T05:01:24.000Z",
        "CatalogPlanProducts": [
            {
                "catalogPlanProductKey": 1,
                "catalogPlanProductId": "CP24060300000001",
                "catalogPlanKey": 2,
                "catalogPlanProductName": "catalog plan product shrishti 4",
                "catalogPlanProductDescription": "this is dev phase",
                "catalogPlanProductMonthlyPrice": 30,
                "catalogPlanProductUOM": "EA",
                "catalogPlanProductCurrency": "US",
                "catalogPlanProductType": "ON",
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003",
                "createdAt": "2022-05-02T06:12:15.000Z",
                "updatedAt": "2022-05-02T06:12:15.000Z",
                "deletedAt": null,
                "catalog_plan_key": 2
            },
            {
                "catalogPlanProductKey": 2,
                "catalogPlanProductId": "CP24060300000002",
                "catalogPlanKey": 2,
                "catalogPlanProductName": "catalog plan product shrishti 4",
                "catalogPlanProductDescription": "this is dev phase",
                "catalogPlanProductMonthlyPrice": 30,
                "catalogPlanProductUOM": "EA",
                "catalogPlanProductCurrency": "US",
                "catalogPlanProductType": "ON",
                "createdBy": "PU24053000000003",
                "updatedBy": "PU24053000000003",
                "createdAt": "2022-05-02T06:13:42.000Z",
                "updatedAt": "2022-05-02T06:13:42.000Z",
                "deletedAt": null,
                "catalog_plan_key": 2
            }
        ]
    })
      const res = await request(app.getServer()).get(`/catalogPlan/${catalogPlanId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
      expect(res.statusCode).toEqual(200)
    })
  })
  describe('[PUT] /catalogPlan/:catalogPlanId - update catalogPlans', () => {
    it('should return 200  with  catlogPlan by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);
      const catalogDetail = await request(app.getServer()).get(`/catalogPlan/${catalogPlanId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
      let requestPayload = {
        "catalogPlanName":"shrishti catalog 1 update",
        "catalogPlanDescription":"this catalog plan id=s for development purpose",
        "catalogPlanType":"MO"
      };
      catalogPlan.update = jest.fn().mockReturnValue({})
      catalogPlan.findByPk = jest.fn().mockReturnValue({
        "catalogPlanKey": 2,
        "catalogPlanId": "CT24060300000006",
        "catalogPlanName": "shrishti catalog 1 update",
        "catalogPlanDescription": "this catalog plan id=s for development purpose",
        "catalogPlanType": "MO",
        "deletedAt": null,
        "createdBy": "PU24053000000003",
        "updatedBy": "PU24053000000003",
        "createdAt": "2022-05-02T05:01:24.000Z",
        "updatedAt": "2022-05-02T05:01:24.000Z"
    })
      const res = await request(app.getServer()).put(`/catalogPlan/${catalogPlanId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`)
      expect(res.statusCode).toEqual(200)
    })
  })

  describe('[POST] /catalogPlanProduct - create  catalog Plan Product', () => {
    it('should return 200  with  catalogPlanProduct', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);

      let requestPayload = {
        "catalogPlanProductName":"catalog plan product shrishti 4",
        "catalogPlanProductDescription":"this is dev phase",
        "catalogPlanProductMonthlyPrice":30,
        "catalogPlanProductUOM":"EA",
        "catalogPlanProductCurrency":"US",
        "catalogPlanProductType":"ON",
        "catalogPlanId":"CT24060300000006"
        };
        catalogPlanProductDB.create = jest.fn().mockReturnValue( {
          "catalogPlanProductKey": 2,
          "catalogPlanProductId": "CP24060300000002",
          "catalogPlanKey": 2,
          "catalogPlanProductCurrency": "US",
          "catalogPlanProductDescription": "this is dev phase",
          "catalogPlanProductMonthlyPrice": 30,
          "catalogPlanProductName": "catalog plan product shrishti 4",
          "catalogPlanProductUOM": "EA",
          "catalogPlanProductType": "ON",
          "createdBy": "PU24053000000003",
          "updatedBy": "PU24053000000003",
          "updatedAt": "2022-05-02T06:13:42.287Z",
          "createdAt": "2022-05-02T06:13:42.287Z"
      })
      const res = await request(app.getServer()).post(`/catalogPlanProduct`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`)
      catalogPlanProductId = res.body.data.catalogPlanProductId;
      expect(res.statusCode).toEqual(201)
    })
  })

  describe('[GET] /catalogPlanProduct/:catalogPlanProductId - get  catalog Plan Product', () => {
    it('should return 200  with  catalogPlanProduct detail', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);

        catalogPlanProductDB.findOne = jest.fn().mockReturnValue({
          "catalogPlanProductKey": 2,
          "catalogPlanProductId": "CP24060300000002",
          "catalogPlanKey": 2,
          "catalogPlanProductName": "catalog plan product shrishti 4",
          "catalogPlanProductDescription": "this is dev phase",
          "catalogPlanProductMonthlyPrice": 30,
          "catalogPlanProductUOM": "EA",
          "catalogPlanProductCurrency": "US",
          "catalogPlanProductType": "ON",
          "createdBy": "PU24053000000003",
          "updatedBy": "PU24053000000003",
          "createdAt": "2022-05-02T06:13:42.000Z",
          "updatedAt": "2022-05-02T06:13:42.000Z",
          "deletedAt": null,
          "catalog_plan_key": 2
      })
      const res = await request(app.getServer()).get(`/catalogPlanProduct/${catalogPlanProductId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`)
      expect(res.statusCode).toEqual(200)
    })
  })

  describe('[PUT] /catalogPlanProduct/:catalogPlanProductId - get  catalog Plan Product', () => {
    it('should return 200  with  catalogPlanProduct detail', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([productCatalogRoute]);
        let updatePayload = {

          "catalogPlanProductName":"catalog plan product shrishti 1 update",
          "catalogPlanProductDescription":"this is dev phase",
          "catalogPlanProductMonthlyPrice":"35.0",
          "catalogPlanProductUOM":"EA",
          "catalogPlanProductCurrency":"US",
          "catalogPlanKey":"1"
          }
        catalogPlanProductDB.update = jest.fn().mockReturnValue({});
        catalogPlanProductDB.findByPk = jest.fn().mockReturnValue({
          "catalogPlanProductKey": 2,
          "catalogPlanProductId": "CP24060300000002",
          "catalogPlanKey": 1,
          "catalogPlanProductName": "catalog plan product shrishti 1 update",
          "catalogPlanProductDescription": "this is dev phase",
          "catalogPlanProductMonthlyPrice": 35,
          "catalogPlanProductUOM": "EA",
          "catalogPlanProductCurrency": "US",
          "catalogPlanProductType": "ON",
          "createdBy": "PU24053000000003",
          "updatedBy": "PU24053000000003",
          "createdAt": "2022-05-02T06:13:42.000Z",
          "updatedAt": "2022-05-02T06:44:03.000Z",
          "deletedAt": null,
          "catalog_plan_key": 1
      })
      const res = await request(app.getServer()).put(`/catalogPlanProduct/${catalogPlanProductId}`).send(updatePayload).set(`X-AUTHORIZATION`, `Bearer ${token}`)
      expect(res.statusCode).toEqual(200)
    })
  })

    describe('[POST] /productPricing - create product pricing', () => {
      it('should return 200  with  product pricing detail', async () => {
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([productCatalogRoute]);
          let reqPayload = {
            "catalogPlanProductMonthlyPriceTo":"2022-12-12 23:59:59",
            "catalogPlanProductMonthlyPriceFrom":"2022-12-31 23:59:59",
            catalogPlanProductId,
            "catalogPlanProductMonthlyPrice":"10"
            }
          catalogPlanProductDB.create = jest.fn().mockReturnValue({reqPayload});
          
        const res = await request(app.getServer()).post(`/productPricing`).send(reqPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`)
        expect(res.statusCode).toEqual(201)
      })
  })
  

})
