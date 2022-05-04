import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import ApiRoute from '@/modules/Api/routes/api.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Api Module', () => {
  let api, apiId, token;
  let apiRoute = new ApiRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    api = apiRoute.apiController.apiService.api;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /api - create new api', () => {
    it('return 200 with new api', async () => {
      const requestPayload = {
        apiName: 'example 1',
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      api.create = jest.fn().mockReturnValue({ ...requestPayload, apiKey: 1 });
      const res = await request(app.getServer()).post('/api').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      apiId = res.body.data.apiId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        apiName: 'example 1',
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      api.create = jest.fn().mockReturnValue({ ...requestPayload, apiKey: 1 });
      const res = await request(app.getServer()).post('/api').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      api.create = jest.fn().mockReturnValue({ ...requestPayload, apiKey: 1 });
      const res = await request(app.getServer()).post('/api').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('[GET] /apis - All apis', () => {
    it('returns 200 with found all apis', async () => {
      api.findAll = jest.fn().mockReturnValue([
        {
          apiId: 'AP24060400000002',
          createdBy: 'SYSTEM',
          updatedBy: null,
          createdAt: '2022-05-03T11:19:18.000Z',
          updatedAt: '2022-05-03T11:19:18.000Z',
          apiName: 'createCustomerAccount',
          apiDescription: 'create customerAccount.',
          apiEndPoint1: 'POST',
          apiEndPoint2: '/customerAccount',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24060400000003',
          createdBy: 'SYSTEM',
          updatedBy: null,
          createdAt: '2022-05-03T11:19:18.000Z',
          updatedAt: '2022-05-03T11:19:18.000Z',
          apiName: 'getCustomerAccounts',
          apiDescription: 'get all customerAccounts.',
          apiEndPoint1: 'GET',
          apiEndPoint2: '/customerAccount',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24060400000004',
          createdBy: 'SYSTEM',
          updatedBy: null,
          createdAt: '2022-05-03T11:19:18.000Z',
          updatedAt: '2022-05-03T11:19:18.000Z',
          apiName: 'getCustomerAccountById',
          apiDescription: 'get customerAccount by customerAccount Id.',
          apiEndPoint1: 'GET',
          apiEndPoint2: '/customerAccount/:customerAccountId',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24060400000005',
          createdBy: 'SYSTEM',
          updatedBy: null,
          createdAt: '2022-05-03T11:19:18.000Z',
          updatedAt: '2022-05-03T11:19:18.000Z',
          apiName: 'updateCustomerAccountById',
          apiDescription: 'update customerAccount by customerAccount Id.',
          apiEndPoint1: 'PUT',
          apiEndPoint2: '/customerAccount/:customerAccountId',
          apiVisibleTF: true,
        },
        {
          apiId: 'AP24060400000006',
          createdBy: 'SYSTEM',
          updatedBy: null,
          createdAt: '2022-05-03T11:19:18.000Z',
          updatedAt: '2022-05-03T11:19:18.000Z',
          apiName: 'addCustomerAddress',
          apiDescription: 'add address to the customerAccount.',
          apiEndPoint1: 'POST',
          apiEndPoint2: '/customerAccount/:customerAccountId/address',
          apiVisibleTF: true,
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      const res = await request(app.getServer()).get('/api').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /api/:apiId -get api by id', () => {
    it('should return 200  with  api by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      api.findOne = jest.fn().mockReturnValue({
        apiId: 'AP24060400000001',
        createdBy: 'PU24060400000002',
        createdAt: '2022-05-03T16:16:19.550Z',
        apiName: 'example 1',
        apiDescription: 'example 1',
        apiEndPoint1: 'example 1',
        apiEndPoint2: 'example 1',
        apiVisibleTF: true,
      });
      const res = await request(app.getServer()).get(`/api/${apiId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe('[PUT] /api/:apiId - update apis', () => {
    it('should return 200  with  catlogPlan by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([apiRoute]);
      const apiDetail = await request(app.getServer()).get(`/api/${apiId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        apiName: 'example edited',
        apiDescription: 'example edited',
        apiEndPoint1: 'example edited',
        apiEndPoint2: 'example edited',
        apiVisibleTF: false,
      };
      api.update = jest.fn().mockReturnValue({});
      api.findByPk = jest.fn().mockReturnValue({
        apiId: 'AP24060400000001',
        createdBy: 'PU24060400000002',
        updatedBy: 'PU24060400000002',
        createdAt: '2022-05-03T16:18:25.000Z',
        updatedAt: '2022-05-03T16:18:35.000Z',
        apiName: 'example edited',
        apiDescription: 'example edited',
        apiEndPoint1: 'example edited',
        apiEndPoint2: 'example edited',
        apiVisibleTF: false,
      });
      const res = await request(app.getServer()).put(`/api/${apiId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
