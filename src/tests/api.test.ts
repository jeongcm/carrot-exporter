import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
const jwt = require('jsonwebtoken');
import ApiRoute from '@/modules/Api/routes/api.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true);
  });
});

describe('API Endpoints', () => {
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
    api.create = jest.fn().mockReturnValue({ ...requestPayload });
    const res = await request(app.getServer()).post('/api').send(requestPayload);
    expect(res.statusCode).toEqual(201);
  });

  test('list all apis created', async () => {
    const apiRoute = new ApiRoute();
    const jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue('Some decoded token');
    const api = apiRoute.apiController.apiService.api;
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([apiRoute]);
    const res = await request(app.getServer()).get('/api').send().set(`X-AUTHORIZATION`, `sesefsdfsdfsdf`);
    expect(res.statusCode).toEqual(200);
  });
});
