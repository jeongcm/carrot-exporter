import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import ApiRoute from '@/modules/Api/routes/api.route';
import { ApiDto } from '@/modules/Api/dtos/api.dto';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing API Module', () => {
  describe('[GET] All apis /api', () => {
    it('response findAll apis', async () => {
      const apiRoute = new ApiRoute();
      const apis = apiRoute.apiController.apiService.api;

      apis.findAll = jest.fn().mockReturnValue([
        {
          apiId: 'AP24052700000001',
          createdBy: 'PU24052700000002',
          updatedBy: null,
          createdAt: '2022-04-26T17:09:30.000Z',
          updatedAt: '2022-04-26T17:09:30.000Z',
          apiName: 'example 1',
          apiDescription: 'example 1',
          apiEndPoint1: 'example 1',
          apiEndPoint2: 'example 1',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24052700000002',
          createdBy: 'PU24052700000002',
          updatedBy: null,
          createdAt: '2022-04-26T17:09:32.000Z',
          updatedAt: '2022-04-26T17:09:32.000Z',
          apiName: 'example 1',
          apiDescription: 'example 1',
          apiEndPoint1: 'example 1',
          apiEndPoint2: 'example 1',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24052700000003',
          createdBy: 'PU24052700000002',
          updatedBy: null,
          createdAt: '2022-04-26T17:09:33.000Z',
          updatedAt: '2022-04-26T17:09:33.000Z',
          apiName: 'example 1',
          apiDescription: 'example 1',
          apiEndPoint1: 'example 1',
          apiEndPoint2: 'example 1',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24052700000004',
          createdBy: 'PU24052700000002',
          updatedBy: null,
          createdAt: '2022-04-26T17:09:34.000Z',
          updatedAt: '2022-04-26T17:09:34.000Z',
          apiName: 'example 1',
          apiDescription: 'example 1',
          apiEndPoint1: 'example 1',
          apiEndPoint2: 'example 1',
          apiVisibleTF: true,
        },
      ]);

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      return request(app.getServer()).get(`${apiRoute.router.get}`).expect(200);
    });
  });

  describe('[GET] API /api/:id', () => {
    it('response findOne api', async () => {
      const apiId = 'AP24052700000001';

      const apiRoute = new ApiRoute();
      const api = apiRoute.apiController.apiService.api;

      api.findByPk = jest.fn().mockReturnValue({
        apiId: 'AP24052700000001',
        createdBy: 'PU24052700000002',
        updatedBy: null,
        createdAt: '2022-04-26T17:09:30.000Z',
        updatedAt: '2022-04-26T17:09:30.000Z',
        apiName: 'example 1',
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      });

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      return request(app.getServer()).get(`${apiRoute.router.get}/${apiId}`).expect(200);
    });
  });

  describe('[POST] /api', () => {
    it('response Create API', async () => {
      const apiData: ApiDto = {
        apiName: 'example 1',
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      }

      const apiRoute = new ApiRoute();
      const api = apiRoute.apiController.apiService.api;

      api.findOne = jest.fn().mockReturnValue(null);
      api.create = jest.fn().mockReturnValue({
        apiName: apiData.apiName,
        apiDescription: apiData.apiDescription,
        apiEndPoint1: apiData.apiEndPoint1,
        apiEndPoint2: apiData.apiEndPoint2,
        apiVisibleTF: apiData.apiVisibleTF,
      });

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      return request(app.getServer()).post(`${apiRoute.router}`).send(apiData).expect(201);
    });
  });

  describe('[PUT] /api/:id', () => {
    it('response Update api', async () => {
      const apiId = 'AP24052700000001';
      const apiData: ApiDto = {
        apiName: 'example 1',
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      }

      const apiRoute = new ApiRoute();
      const api = apiRoute.apiController.apiService.api;

      api.findByPk = jest.fn().mockReturnValue({
        apiName: apiData.apiName,
        apiDescription: apiData.apiDescription,
        apiEndPoint1: apiData.apiEndPoint1,
        apiEndPoint2: apiData.apiEndPoint2,
        apiVisibleTF: apiData.apiVisibleTF,
      });
      api.update = jest.fn().mockReturnValue([apiId]);
      api.findByPk = jest.fn().mockReturnValue({
        apiName: apiData.apiName,
        apiDescription: apiData.apiDescription,
        apiEndPoint1: apiData.apiEndPoint1,
        apiEndPoint2: apiData.apiEndPoint2,
        apiVisibleTF: apiData.apiVisibleTF,
      });

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      return request(app.getServer()).put(`${apiRoute.router}/${apiId}`).send(apiData).expect(200);
    });
  });

});
