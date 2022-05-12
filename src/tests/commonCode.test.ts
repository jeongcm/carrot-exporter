import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import CommonCodeRoute from '@/modules/CommonCode/routes/commonCode.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing CommonCode Module', () => {
  let commonCode, commonCodeId, token;
  let commonCodeRoute = new CommonCodeRoute();


  beforeAll(async () => {
    let partRoute = new PartyRoute();
    commonCode = commonCodeRoute.commonCodeController.commonCodeService.commonCode;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /commonCode - create new commonCode', () => {
    it('return 200 with new commonCode', async () => {
      const requestPayload = {
        commonCodeName: 'some name',
        commonCodeCode: 'WW',
        commonCodeDescription: 'example',
        commonCodeDisplayENG: 'example',
        commonCodeDisplayKOR: 'example',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([commonCodeRoute]);
      commonCode.create = jest.fn().mockReturnValue({ ...requestPayload, commonCodeKey: 1 });
      const res = await request(app.getServer()).post('/commonCode').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      commonCodeId = res.body.data.commonCodeId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        commonCodeName: 'some name',
        commonCodeCode: 'WW',
        commonCodeDescription: 'example',
        commonCodeDisplayENG: 'example',
        commonCodeDisplayKOR: 'example',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([commonCodeRoute]);
      commonCode.create = jest.fn().mockReturnValue({ ...requestPayload, commonCodeKey: 1 });
      const res = await request(app.getServer()).post('/commonCode').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        commonCodeCode: 'WW',
        commonCodeDescription: 'example',
        commonCodeDisplayENG: 'example',
        commonCodeDisplayKOR: 'example',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([commonCodeRoute]);
      commonCode.create = jest.fn().mockReturnValue({ ...requestPayload, commonCodeKey: 1 });
      const res = await request(app.getServer()).post('/commonCode').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('[GET] /commonCodes - All commonCodes', () => {
    it('returns 200 with found all commonCodes', async () => {
      commonCode.findAll = jest.fn().mockReturnValue([
        [
          {
            commonCodeId: 'CC24060400000010',
            createdBy: 'PU24060400000002',
            updatedBy: null,
            createdAt: '2022-05-03T17:00:03.000Z',
            updatedAt: '2022-05-03T17:00:03.000Z',
            commonCodeName: 'some name',
            commonCodeCode: 'WW',
            commonCodeDescription: 'example',
            commonCodeDisplayENG: 'example',
            commonCodeDisplayKOR: 'example',
          },
          {
            commonCodeId: 'CC24060400000014',
            createdBy: 'PU24060400000002',
            updatedBy: null,
            createdAt: '2022-05-03T17:50:46.000Z',
            updatedAt: '2022-05-03T17:50:46.000Z',
            commonCodeName: 'some namde',
            commonCodeCode: 'Wq',
            commonCodeDescription: 'example',
            commonCodeDisplayENG: 'example',
            commonCodeDisplayKOR: 'example',
          },
          {
            commonCodeId: 'CC24060400000015',
            createdBy: 'PU24060400000002',
            updatedBy: null,
            createdAt: '2022-05-03T17:51:08.000Z',
            updatedAt: '2022-05-03T17:51:08.000Z',
            commonCodeName: 'some namde',
            commonCodeCode: 'qq',
            commonCodeDescription: 'example',
            commonCodeDisplayENG: 'example',
            commonCodeDisplayKOR: 'example',
          },
        ],
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([commonCodeRoute]);
      const res = await request(app.getServer()).get('/commonCode').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /commonCode/:commonCodeId -get commonCode by id', () => {
    it('should return 200  with  commonCode by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([commonCodeRoute]);
      commonCode.findOne = jest.fn().mockReturnValue({
        commonCodeId: 'CC24060400000001',
        createdBy: 'PU24060400000002',
        updatedBy: null,
        createdAt: '2022-05-03T17:55:23.000Z',
        updatedAt: '2022-05-03T17:55:23.000Z',
        commonCodeName: 'some namde',
        commonCodeCode: 'rq',
        commonCodeDescription: 'example',
        commonCodeDisplayENG: 'example',
        commonCodeDisplayKOR: 'example',
      });
      const res = await request(app.getServer()).get(`/commonCode/${commonCodeId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe('[PUT] /commonCode/:commonCodeId - update commonCodes', () => {
    it('should return 200  with  catlogPlan by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([commonCodeRoute]);
      const commonCodeDetail = await request(app.getServer()).get(`/commonCode/${commonCodeId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        commonCodeCode: 'WW',
        commonCodeName: "some name",
        commonCodeDescription: 'example',
        commonCodeDisplayENG: 'example',
        commonCodeDisplayKOR: 'example',
      };
      commonCode.update = jest.fn().mockReturnValue({});
      commonCode.findByPk = jest.fn().mockReturnValue({
        commonCodeId: 'CC24060400000001',
        createdBy: 'PU24060400000002',
        updatedBy: null,
        createdAt: '2022-05-03T17:55:23.000Z',
        updatedAt: '2022-05-03T17:55:23.000Z',
        commonCodeName: 'some namde',
        commonCodeCode: 'rq',
        commonCodeDescription: 'example',
        commonCodeDisplayENG: 'example',
        commonCodeDisplayKOR: 'example',
      });
      const res = await request(app.getServer()).put(`/commonCode/${commonCodeId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
