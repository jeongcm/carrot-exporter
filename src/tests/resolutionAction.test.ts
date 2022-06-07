import App from '@/app';
import ResolutionActionRoute from '@/modules/MetricOps/routes/resolutionAction.route';
import PartyRoute from '@/modules/Party/routes/party.route';
import { Sequelize } from 'sequelize';
import request from 'supertest';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing ResolutionAction Module', () => {
  let resolutionAction, resolutionActionId, token, resolutionActionService;
  let resolutionActionRoute = new ResolutionActionRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    resolutionAction = resolutionActionRoute.resoltutionActionController.resolutionActionService.resolutionAction;
    resolutionActionService = resolutionActionRoute.resoltutionActionController.resolutionActionService;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /resolutionAction - create new ResolutionAction', () => {
    it('return 200 with new ResolutionAction', async () => {
      const requestPayload = {
        resolutionActionName: 'Action',
        resolutionActionDescription: 'test puprose',
        sudoryTemplateId: 'ST24070300000001',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([resolutionActionRoute]);
      resolutionAction.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/resolutionAction').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      resolutionActionId = res.body.data.resolutionActionId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        resolutionActionName: 'Action',
        resolutionActionDescription: 'test puprose',
        sudoryTemplateId: 'ST24070300000001',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([resolutionActionRoute]);
      resolutionAction.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/resolutionAction').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('[GET] /resolutionActions - All ResolutionActions', () => {
    it('returns 200 with found all ResolutionActions', async () => {
      resolutionAction.findAll = jest.fn().mockReturnValue([
        {
          resolutionActionKey: 1,
          resolutionActionId: 'RA24070700000001',
          createdBy: 'PU24070300000002',
          updatedBy: null,
          createdAt: '2022-06-06T05:36:57.000Z',
          updatedAt: '2022-06-06T05:36:57.000Z',
          deletedAt: null,
          resolutionActionName: 'Action',
          resolutionActionDescription: 'test puprose',
          sudoryTemplateKey: 1,
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([resolutionActionRoute]);
      const res = await request(app.getServer()).get('/resolutionActions').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /resolutionAction/:resolutionActionId -get api by id', () => {
    it('should return 200  with  api by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([resolutionActionRoute]);
      resolutionAction.findOne = jest.fn().mockReturnValue({
        resolutionActionKey: 1,
        resolutionActionId: 'RA24070700000001',
        createdBy: 'PU24070300000002',
        updatedBy: null,
        createdAt: '2022-06-06T05:36:57.000Z',
        updatedAt: '2022-06-06T05:36:57.000Z',
        deletedAt: null,
        resolutionActionName: 'Action',
        resolutionActionDescription: 'test puprose',
        sudoryTemplateKey: 1,
      });
      const res = await request(app.getServer()).get(`/resolutionAction/${resolutionActionId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[PUT] /resolutionAction/:resolutionActionId - update resolutionAction', () => {
    it('should return 200  with  ResolutionAction by resolutionActionId', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([resolutionActionRoute]);
      const apiDetail = await request(app.getServer())
        .get(`/resolutionAction/${resolutionActionId}`)
        .send()
        .set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        resolutionActionName: 'Action Edit',
      };
      resolutionAction.update = jest.fn().mockReturnValue({});
      resolutionAction.findByPk = jest.fn().mockReturnValue({
        resolutionActionKey: 1,
        resolutionActionId: 'RA24070700000001',
        createdBy: 'PU24070300000002',
        updatedBy: 'PU24070300000002',
        createdAt: '2022-06-06T05:36:57.000Z',
        updatedAt: '2022-06-06T06:38:28.000Z',
        deletedAt: null,
        resolutionActionName: 'Action Edit',
        resolutionActionDescription: 'test puprose',
        sudoryTemplateKey: 1,
      });
      const res = await request(app.getServer())
        .put(`/resolutionAction/${resolutionActionId}`)
        .send(requestPayload)
        .set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
