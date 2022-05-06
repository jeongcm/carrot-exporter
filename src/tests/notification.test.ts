import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import NotificationRoute from '@/modules/Notification/routes/notification.route';
import PartyRoute from '@/modules/Party/routes/party.route';

// you have to create a "message" table before run this test
afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Notification Module', () => {
  let notification, notificationId, token;
  let notificationRoute = new NotificationRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    notification = notificationRoute.notificationController.notificationService.notificaion;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /notification- create new notification', () => {
    it('return 200 with new notification', async () => {
      const requestPayload = {
        messageId: '1',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([notificationRoute]);
      notification.create = jest.fn().mockReturnValue({ ...requestPayload, notificationKey: 1 });
      const res = await request(app.getServer()).post('/notification').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      notificationId = res.body.data.notificationId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        messageId: '1',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([notificationRoute]);
      notification.create = jest.fn().mockReturnValue({ ...requestPayload, notificationKey: 1 });
      const res = await request(app.getServer()).post('/notification').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {};
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([notificationRoute]);
      notification.create = jest.fn().mockReturnValue({ ...requestPayload, notificationKey: 1 });
      const res = await request(app.getServer()).post('/notification').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('[GET] /notification - All notification', () => {
    it('returns 200 with found all notification', async () => {
      notification.findAll = jest.fn().mockReturnValue([
        {
          notificationKey: 1,
          notificationId: 'NO24060400000002',
          partyChannelKey: 1,
          partyKey: 2,
          createdAt: '2022-05-03T17:08:45.000Z',
          updatedAt: '2022-05-03T17:08:45.000Z',
          notificationStatus: null,
          notificationStatutsUpdatedAt: '2022-05-03T17:08:45.000Z',
          customerAccountKey: 2,
        },
        {
          notificationKey: 2,
          notificationId: 'NO24060400000003',
          partyChannelKey: 1,
          partyKey: 2,
          createdAt: '2022-05-03T17:14:49.000Z',
          updatedAt: '2022-05-03T17:14:49.000Z',
          notificationStatus: null,
          notificationStatutsUpdatedAt: '2022-05-03T17:14:49.000Z',
          customerAccountKey: 2,
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([notificationRoute]);
      const res = await request(app.getServer()).get('/notification').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /notification/:notificationId -get notification by id', () => {
    it('should return 200  with  notification by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([notificationRoute]);
      notification.findOne = jest.fn().mockReturnValue({
        notificationKey: 1,
        notificationId: 'NO24060400000002',
        partyChannelKey: 1,
        partyKey: 2,
        messageKey: 1,
        createdBy: 'PU24060400000001',
        updatedBy: null,
        createdAt: '2022-05-03T17:08:45.000Z',
        updatedAt: '2022-05-03T17:08:45.000Z',
        deletedAt: null,
        notificationStatus: null,
        notificationStatutsUpdatedAt: '2022-05-03T17:08:45.000Z',
        customerAccountKey: 2,
      });
      const res = await request(app.getServer()).get(`/notification/${notificationId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe('[PUT] /notification/:notificationId- update notification', () => {
    it('should return 200  with  notification by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([notificationRoute]);
      const apiDetail = await request(app.getServer()).get(`/notification/${notificationId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        messageId: '1',
        notificationStatus: 'CR',
      };
      notification.update = jest.fn().mockReturnValue({});
      notification.findByPk = jest.fn().mockReturnValue({
        notificationKey: 1,
        notificationId: 'NO24060400000002',
        partyChannelKey: 1,
        partyKey: 2,
        messageKey: 1,
        createdBy: 'PU24060400000001',
        updatedBy: 'PU24060400000001',
        createdAt: '2022-05-03T17:08:45.000Z',
        updatedAt: '2022-05-03T17:18:26.000Z',
        deletedAt: null,
        notificationStatus: 'CR',
        notificationStatutsUpdatedAt: '2022-05-03T17:18:26.000Z',
        customerAccountKey: 2,
      });
      const res = await request(app.getServer())
        .put(`/notification/${notificationId}`)
        .send(requestPayload)
        .set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
