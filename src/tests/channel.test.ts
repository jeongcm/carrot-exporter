import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import ChannelsRoute from '@/modules/Messaging/routes/channel.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Channel Module', () => {
  let channel, channelId, token;
  let channelRoute = new ChannelsRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    channel = channelRoute.channelController.channelService.channels;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /channels- create new channel', () => {
    it('return 200 with new channel', async () => {
      const requestPayload = {
        channelDescription: 'example',
        channelType: 'EMAIL',
        channelName: 'example',
        channelAdaptor: {
          key: 'value',
        },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([channelRoute]);
      channel.create = jest.fn().mockReturnValue({ ...requestPayload, channelKey: 1 });
      const res = await request(app.getServer()).post('/channels').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      channelId = res.body.data.channelId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        channelDescription: 'example',
        channelType: 'EMAIL',
        channelName: 'example',
        channelAdaptor: {
          key: 'value',
        },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([channelRoute]);
      channel.create = jest.fn().mockReturnValue({ ...requestPayload, channelKey: 1 });
      const res = await request(app.getServer()).post('/channels').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        channelDescription: 'example',
        channelType: 'EMAIL',
        channelAdaptor: {
          key: 'value',
        },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([channelRoute]);
      channel.create = jest.fn().mockReturnValue({ ...requestPayload, channelKey: 1 });
      const res = await request(app.getServer()).post('/channels').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('[GET] /channels - All channels', () => {
    it('returns 200 with found all channels', async () => {
      channel.findAll = jest.fn().mockReturnValue([
        {
          customerAccountKey: 2,
          channelId: 'CH24060400000001',
          channelName: 'example1',
          channelDescription: 'example1',
          channelType: 'EMAIL1',
          channelAdaptor: {
            key: 'value1',
          },
          createdAt: '2022-05-03T16:29:05.000Z',
          updatedAt: '2022-05-03T16:29:05.000Z',
        },
        {
          customerAccountKey: 2,
          channelId: 'CH24060400000002',
          channelName: 'example',
          channelDescription: 'example',
          channelType: 'EMAIL',
          channelAdaptor: {
            key: 'value',
          },
          createdAt: '2022-05-03T16:29:30.000Z',
          updatedAt: '2022-05-03T16:29:30.000Z',
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([channelRoute]);
      const res = await request(app.getServer()).get('/channels').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /channels/:channelId -get channel by id', () => {
    it('should return 200  with  channel by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([channelRoute]);
      channel.findOne = jest.fn().mockReturnValue({
        channelKey: 1,
        customerAccountKey: 2,
        channelName: 'example1',
        channelDescription: 'example1',
        channelType: 'EMAIL1',
        channelAdaptor: {
          key: 'value1',
        },
        createdAt: '2022-05-03T16:29:05.000Z',
        updatedAt: '2022-05-03T16:29:05.000Z',
      });
      const res = await request(app.getServer()).get(`/channels/${channelId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe('[PUT] /channels/:channelId- update channel', () => {
    it('should return 200  with  channel by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([channelRoute]);
      const apiDetail = await request(app.getServer()).get(`/channels/${channelId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        channelDescription: 'example edited',
        channelType: 'EMAIL',
        channelName: 'example edited',
        channelAdaptor: {
          key: 'value edited',
        },
      };
      channel.update = jest.fn().mockReturnValue({});
      channel.findByPk = jest.fn().mockReturnValue({
        channelKey: 1,
        customerAccountKey: 2,
        channelName: 'example edited',
        channelDescription: 'example edited',
        channelType: 'EMAIL',
        channelAdaptor: {
          key: 'value edited',
        },
        createdAt: '2022-05-04T07:18:48.000Z',
        updatedAt: '2022-05-04T07:22:14.000Z',
      });
      const res = await request(app.getServer()).put(`/channels/${channelId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
