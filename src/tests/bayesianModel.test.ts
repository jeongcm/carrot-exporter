import App from '@/app';
import BayesianModelRoute from '@/modules/MetricOps/routes/bayesianModel.route';
import SudoryTemplateRoute from '@/modules/MetricOps/routes/sudoryTemplate.route';
import PartyRoute from '@/modules/Party/routes/party.route';
import { Sequelize } from 'sequelize';
import request from 'supertest';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing SodoryTemplate Module', () => {
  let bayesianModel, bayesianModelId, token, bayesianModelService;
  let bayesianModelRoute = new BayesianModelRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    bayesianModel = bayesianModelRoute.bayesianModelController.bayesianModelService.bayesianModel;
    bayesianModelService = bayesianModelRoute.bayesianModelController.bayesianModelService;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /bayesianModel - create BayesianModel', () => {
    it('return 200 with new BayesianModel', async () => {
      const requestPayload = {
        bayesianModelName: 'shrishti model',
        bayesianModelDescription: ' description add',
        bayesianModelResourceType: 'ND',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([bayesianModelRoute]);
      bayesianModel.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/bayesianModel').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      bayesianModelId = res.body.data.bayesianModelId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        bayesianModelName: 'shrishti model',
        bayesianModelDescription: ' description add',
        bayesianModelResourceType: 'ND',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([bayesianModelRoute]);
      bayesianModel.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/bayesianModel').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('[GET] /bayesianModels - All BayesianModel', () => {
    it('returns 200 with found all BayesianModel', async () => {
      bayesianModel.findAll = jest.fn().mockReturnValue([
        {
          bayesianModelKey: 1,
          bayesianModelId: 'BM24070300000001',
          createdBy: 'PU24070300000002',
          updatedBy: null,
          createdAt: '2022-06-02T07:15:17.000Z',
          updatedAt: '2022-06-02T07:15:17.000Z',
          deletedAt: null,
          bayesianModelName: 'shrishti model',
          bayesianModelDescription: ' description add',
          customerAccountKey: 2,
          bayesianModelResourceType: 'ND',
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([bayesianModelRoute]);
      const res = await request(app.getServer()).get('/bayesianModels').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /bayesianModel/:bayesianModelId -get api by id', () => {
    it('should return 200  with  api by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([bayesianModelRoute]);
      bayesianModel.findOne = jest.fn().mockReturnValue({
        bayesianModelKey: 1,
        bayesianModelId: 'BM24070300000001',
        createdBy: 'PU24070300000002',
        updatedBy: null,
        createdAt: '2022-06-02T07:15:17.000Z',
        updatedAt: '2022-06-02T07:15:17.000Z',
        deletedAt: null,
        bayesianModelName: 'shrishti model',
        bayesianModelDescription: ' description add',
        customerAccountKey: 2,
        bayesianModelResourceType: 'ND',
      });
      const res = await request(app.getServer()).get(`/bayesianModel/${bayesianModelId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[PUT] /bayesianModel/:bayesianModelId - update BayesianModel', () => {
    it('should return 200  with  BayesianModel by bayesianModelId', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([bayesianModelRoute]);
      const apiDetail = await request(app.getServer()).get(`/bayesianModel/${bayesianModelId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        bayesianModelResourceType: 'SV',
      };
      bayesianModel.update = jest.fn().mockReturnValue({});
      bayesianModel.findByPk = jest.fn().mockReturnValue({
        bayesianModelKey: 1,
        bayesianModelId: 'BM24070300000001',
        createdBy: 'PU24070300000002',
        updatedBy: 'PU24070300000002',
        createdAt: '2022-06-02T07:15:17.000Z',
        updatedAt: '2022-06-02T07:26:55.000Z',
        deletedAt: null,
        bayesianModelName: 'shrishti model',
        bayesianModelDescription: ' description add',
        customerAccountKey: 2,
        bayesianModelResourceType: 'SV',
      });
      const res = await request(app.getServer())
        .put(`/bayesianModel/${bayesianModelId}`)
        .send(requestPayload)
        .set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
