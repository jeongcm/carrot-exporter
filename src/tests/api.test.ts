import { Sequelize } from 'sequelize';
import request from 'supertest';
const bodyParser = require("body-parser");
import App from '@/app';
import { CreateCatalogPlanDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import ProductCatalogRoute from '@/modules/ProductCatalog/routes/productCatalog.route';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
const jwt = require('jsonwebtoken');

import { cleanEnv, email, host, num, port, str } from 'envalid';
import ApiRoute from '@/modules/Api/routes/api.route';
import { ApiDto } from '@/modules/Api/dtos/api.dto';


afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})

describe('Post Endpoints', () => {
  test('[POST] /api', async () => {
    const jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue('Some decoded token');
    const apiRoute = new ApiRoute();
    const api = apiRoute.apiController.apiService.api;
    const requestPayload = {
      apiName: 'example 1',
      apiDescription: 'example 1',
      apiEndPoint1: 'example 1',
      apiEndPoint2: 'example 1',
      apiVisibleTF: true,
    };
  (Sequelize as any).authenticate = jest.fn();
  const app = new App([apiRoute]);
  api.create = jest.fn().mockReturnValue({...requestPayload});
  const res = await request(app.getServer()).post('/api').send(requestPayload)
    // .set('x-authorization', `Bearer ${request.token}`) //Authorization token
    expect(res.statusCode).toEqual(201)
  })
})


  
  