import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import { CreateCatalogPlanDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';
import { cleanEnv, email, host, num, port, str } from 'envalid';


afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})

describe('Post Endpoints', () => {
  test('should create a new post', async () => {
    let planType = "OB"
    const productCatalogRoute = new ProductCatalogRoute();
    const catalogPlan = productCatalogRoute.productCatalogController.productCatalogService.catalogPlan;
    const requestPayload = {
      "catalogPlanName":"shrishti catalog 2",
      "catalogPlanDescription":"this catalog plan id=s for development purpose",
      "catalogPlanType":planType
  };
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([productCatalogRoute]);
    const res = await request(app.getServer()).post('/catalogPlan').send(requestPayload)
    expect(res.error).toEqual("his shrishti")
    expect(res.statusCode).toEqual(201)
    
    
    // expect(res.body).toHaveProperty('post')
  })

  
  test('should create a new post', async () => {
    const productCatalogRoute = new ProductCatalogRoute();
    const catalogPlan = productCatalogRoute.productCatalogController.productCatalogService.catalogPlan;
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([productCatalogRoute]);
    const res = await request(app.getServer()).get('/catalogPlans').send().set(`X-AUTHORIZATION`, `sesefsdfsdfsdf`)
    expect(res.statusCode).toEqual(200)
    
    // expect(res.body).toHaveProperty('post')
  })
})


  
  