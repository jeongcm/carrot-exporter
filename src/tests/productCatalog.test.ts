import { Sequelize } from 'sequelize';
import request from 'supertest';
const bodyParser = require("body-parser");
import App from '@/app';
import { CreateCatalogPlanDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';
import partyRoute from '@/modules/Party/routes/party.route';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
const jwt = require('jsonwebtoken');

import { cleanEnv, email, host, num, port, str } from 'envalid';

let token;

    beforeAll(async (done) => {
    const app = new App([new partyRoute()]);

      const res = await request(app.getServer()).post('/login').send({
        "userId" : "shrishti.raj@gmail.com",
        "password" : "Password@123!"
    })
        .end((err, response) => {
          token = response.body.token; // save the token!
          done();
        });
    });

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})


describe('Post Endpoints', () => {
  
  test('[POST] /catalogPlan', async () => {
    const verify = jest.spyOn(jwt, 'verify');
    verify.mockImplementation(() => () => ({ verified: 'true' }));
    let planType = "OB"
    const productCatalogRoute = new ProductCatalogRoute();
    const catalogPlan = productCatalogRoute.productCatalogController.productCatalogService.catalogPlan;
    const requestPayload = {
      "catalogPlanName":"shrishti catalog 2",
      "catalogPlanDescription":"this catalog plan id=s for development purpose",
      "catalogPlanType":"OB"
  };
  (Sequelize as any).authenticate = jest.fn();
  const app = new App([productCatalogRoute]);
  catalogPlan.create = jest.fn().mockReturnValue({...requestPayload, catalogPlanKey:121336});
    const res = await request(app.getServer()).post('/catalogPlan').send(requestPayload)
    .set('x-authorization', `Bearer ${token}`) //Authorization token
    expect(res.statusCode).toEqual(201)
    
    
    // expect(res.body).toHaveProperty('post')
  })

  
  test('should get all catlogPlan list', async () => {
    const productCatalogRoute = new ProductCatalogRoute();
    const jwtSpy = jest.spyOn(jwt, 'verify');
        jwtSpy.mockReturnValue('Some decoded token');
    const catalogPlan = productCatalogRoute.productCatalogController.productCatalogService.catalogPlan;
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([productCatalogRoute]);

    const res = await request(app.getServer()).get('/catalogPlans').send().set(`X-AUTHORIZATION`, `sesefsdfsdfsdf`)
    expect(res.statusCode).toEqual(200)
    
    // expect(res.body).toHaveProperty('post')
  })
  test('should get  catlogPlan by id', async () => {
    const productCatalogRoute = new ProductCatalogRoute();
    const catalogPlan = productCatalogRoute.productCatalogController.productCatalogService.catalogPlan;
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([productCatalogRoute]);
    const res = await request(app.getServer()).get('/catalogPlan/r289374289374').send().set(`X-AUTHORIZATION`, `sesefsdfsdfsdf`)
    expect(res.statusCode).toEqual(200)
    
    // expect(res.body).toHaveProperty('post')
  })
})


  
  