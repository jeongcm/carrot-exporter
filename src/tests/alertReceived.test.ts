import App from '@/app';
import AlertRoute from '@/modules/Alert/routes/alert.route';
import partyRoute from '@/modules/Party/routes/party.route';
import { Sequelize } from 'sequelize';
import request from 'supertest';
afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing AlertReceived Module', () => {
  let alertReceived, alertReceivedId, token;
  let alertRoute = new AlertRoute();

  beforeAll(async () => {
    let partRoute = new partyRoute();
    alertReceived = alertRoute.alertController.alertReceivedService.alertReceived;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /alert/received- create new AlertReceived', () => {
    it('return 200 with new Alert Received', async () => {
      const requestPayload = {
        alertReceivedName: 'Alert Received Name',
        alertReceivedSeverity: 'critical',
        alertReceivedState: 'inactive',
        alertReceivedDescription: 'alert received description',
        alertReceivedSummary: 'alert receive summary',
        alertReceivedValue: 'this is alert recieved value',
        alertReceivedNamespace: 'alert receive namespace',
        alertReceivedNode: 'alert received node',
        alertReceivedPinned: false,
        alertReceivedInstance: 'alert received instance',
        alertReceivedLabels: { key: 'value' },
        alertReceivedService: 'alertReceivedService',
        alertReceivedPod: 'alertReceivedPod',
      };

      const responsePayload = {
        alertReceivedKey: 2,
        alertReceivedName: 'Alert Received Name',
        alertReceivedSeverity: 'critical',
        alertReceivedState: 'inactive',
        alertReceivedDescription: 'alert received description',
        alertReceivedSummary: 'alert receive summary',
        alertReceivedValue: 'this is alert recieved value',
        alertReceivedNamespace: 'alert receive namespace',
        alertReceivedNode: 'alert received node',
        alertReceivedPinned: false,
        alertReceivedInstance: 'alert received instance',
        alertReceivedLabels: {
          key: 'value',
        },
        alertReceivedService: 'alertReceivedService',
        alertReceivedPod: 'alertReceivedPod',
        customerAccountKey: 3,
        alertReceivedId: 'AR24060600000005',
        alertReceivedActiveAt: '2022-05-05T09:19:12.038Z',
        createdAt: '2022-05-05T09:19:12.038Z',
        createdBy: 'PU24060600000003',
        alertRuleKey: 1,
        updatedAt: '2022-05-05T09:19:12.038Z',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([alertRoute]);
      alertReceived.create = jest.fn().mockReturnValue(responsePayload);
      const res = await request(app.getServer()).post('/alert/received').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      alertReceivedId = res.body.data.alertReceivedId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        alertReceivedName: 'Alert Received Name',
        alertReceivedSeverity: 'critical',
        alertReceivedState: 'inactive',
        alertReceivedDescription: 'alert received description',
        alertReceivedSummary: 'alert receive summary',
        alertReceivedValue: 'this is alert recieved value',
        alertReceivedNamespace: 'alert receive namespace',
        alertReceivedNode: 'alert received node',
        alertReceivedPinned: false,
        alertReceivedInstance: 'alert received instance',
        alertReceivedLabels: { key: 'value' },
        alertReceivedService: 'alertReceivedService',
        alertReceivedPod: 'alertReceivedPod',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([alertRoute]);
      alertReceived.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/alert/received').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    describe('[GET] /alert/received - All AlertReceived', () => {
      it('returns 200 with found all AlertReceived', async () => {
        alertReceived.findAll = jest.fn().mockReturnValue([
          {
            customerAccountKey: 3,
            alertRuleKey: 1,
            alertReceivedId: 'AR24060600000001',
            createdAt: '2022-05-05T06:51:29.000Z',
            updatedAt: '2022-05-05T06:51:29.000Z',
            alertReceivedName: 'Alert Received Name',
            alertReceivedValue: 'this is alert recieved value',
            alertReceivedState: 'inactive',
            alertReceivedNamespace: 'alert receive namespace',
            alertReceivedSeverity: 'critical',
            alertReceivedDescription: 'alert received description',
            alertReceivedSummary: 'alert receive summary',
            alertReceivedActiveAt: '2022-05-05T06:51:29.000Z',
            alertReceivedNode: 'alert received node',
            alertReceivedService: 'alertReceivedService',
            alertReceivedPod: 'alertReceivedPod',
            alertReceivedInstance: 'alert received instance',
            alertReceivedLabels: {
              key: 'value',
            },
            alertReceivedPinned: false,
          },
        ]);
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([alertRoute]);
        const res = await request(app.getServer()).get('/alert/received').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      });
    });

    describe('[PUT] /alert/received/:alertReceivedId- update AlertReceived', () => {
      it('should return 200  with  AlertReceived by alertReceivedId', async () => {
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([alertRoute]);
        let requestPayload = {
          alertReceivedName: 'modify Alert Received Name',
          alertReceivedSeverity: 'modify critical',
          alertReceivedState: 'modify inactive',
          alertReceivedDescription: 'modify alert received description',
          alertReceivedSummary: 'modify alert receive summary',
          alertReceivedValue: 'modify this is alert recieved value',
          alertReceivedNamespace: 'alert receive namespace',
          alertReceivedNode: 'alert received node',
          alertReceivedPinned: false,
          alertReceivedInstance: 'alert received instance',
          alertReceivedLabels: { key: 'value' },
          alertReceivedService: 'alertReceivedService',
          alertReceivedPod: 'alertReceivedPod',
        };

        alertReceived.update = jest.fn().mockReturnValue({});
        alertReceived.findAlertReceivedById = jest.fn().mockReturnValue({
          alertReceivedKey: 2,
          customerAccountKey: 3,
          alertRuleKey: 1,
          createdAt: '2022-05-05T09:19:12.000Z',
          updatedAt: '2022-05-05T14:54:35.000Z',
          alertReceivedName: 'modify Alert Received Name',
          alertReceivedValue: 'modify this is alert recieved value',
          alertReceivedState: 'modify inactive',
          alertReceivedNamespace: 'alert receive namespace',
          alertReceivedSeverity: 'modify critical',
          alertReceivedDescription: 'modify alert received description',
          alertReceivedSummary: 'modify alert receive summary',
          alertReceivedActiveAt: '2022-05-05T09:19:12.000Z',
          alertReceivedNode: 'alert received node',
          alertReceivedService: 'alertReceivedService',
          alertReceivedPod: 'alertReceivedPod',
          alertReceivedInstance: 'alert received instance',
          alertReceivedLabels: {
            key: 'value',
          },
          alertReceivedPinned: false,
        });
        const res = await request(app.getServer())
          .put(`/alert/received/${alertReceivedId}`)
          .send(requestPayload)
          .set(`X-AUTHORIZATION`, `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      });
    });

    describe('[DELETE] /alert/received/:alertReceivedId - delete AlertReceived', () => {
      it('return 200 and delete AlertReceived ', async () => {
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([alertRoute]);

        const res = await request(app.getServer()).delete(`/alert/received/${alertReceivedId}`).send().set('X-AUTHORIZATION', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
      });
      it('return 204 and not able to delete AlertReceived ', async () => {
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([alertRoute]);

        const res = await request(app.getServer()).delete(`/alert/received/${alertReceivedId}`).send().set('X-AUTHORIZATION', `Bearer ${token}`);

        expect(res.statusCode).toBe(204);
      });
    });
  });
});