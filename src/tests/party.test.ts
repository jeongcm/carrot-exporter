import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';

import PartyRoute from '@/modules/Party/routes/party.route';
import { getLoginUserAccount } from './customerAccount.test';
import CustomerAccountRoute from '@/modules/CustomerAccount/routes/customerAccount.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Party Module', () => {
  let partyRoute;
  let partyDB;
  let loginUser;

  beforeAll(async () => {
    partyRoute = new PartyRoute();
    partyDB = partyRoute.partyController.partyService.party;

    loginUser = await getLoginUserAccount();
  });

  describe('[POST] /login', () => {
    it('returns 200 with user information', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const loginAccount = { userId: 'operator@nexclipper.io', password: 'Password@123!' };

      const login = await request(app.getServer()).post('/login').send(loginAccount);

      expect(login.statusCode).toBe(200);
    });

    it('returns 409 when login with invalid user', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const invalidAccount = { userId: 'operator@nexclipper.io', password: 'InvalidPassword!' };

      const login = await request(app.getServer()).post('/login').send(invalidAccount);

      expect(login.statusCode).toBe(409);
    });
  });

  describe('[GET] /party/user - get all partyUser in the same customerAccount', () => {
    it('returns 200', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const response = await request(app.getServer()).get('/party/user').set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('[GET] /party/user/:partyId - get a partyUser', () => {
    it('returns 200 with partyUser information', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const allPartyUser = await request(app.getServer()).get('/party/user').set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      const response = await request(app.getServer())
        .get(`/party/user/${allPartyUser.body.data[0].partyId}`)
        .set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(200);
    });

    it('returns 404 with invalid userId', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const response = await request(app.getServer()).get(`/party/user/PU000000000`).set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('[PUT] /party/user/:partyId - update a partyUser', () => {
    it('returns 200 with updated partyUser information', async () => {
      // put 은 목으로 만들기!
      //   (Sequelize as any).authenticate = jest.fn();
      //   const app = new App([partyRoute]);
      //   const allPartyUser = await request(app.getServer()).get('/party/user').set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);
      //   const response = await request(app.getServer())
      //     .put(`/party/user/${allPartyUser.body.data[0].partyId}`)
      //     .send({
      //       partyName: 'John Doe --modified',
      //       partyDescription: 'Head of OPS --modified',
      //       firstName: 'John',
      //       lastName: 'Doe',
      //       mobile: '+1-310-333-2222',
      //       partyUserStatus: 'AC',
      //     })
      //     .set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);
      //   expect(response.statusCode).toBe(200);
    });

    it('returns 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const allPartyUser = await request(app.getServer()).get('/party/user').set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      const response = await request(app.getServer()).put(`/party/user/${allPartyUser.body.data[0].partyId}`).send({
        partyName: 'John Doe --modified',
        partyDescription: 'Head of OPS --modified',
        firstName: 'John',
        lastName: 'Doe',
        mobile: '+1-310-333-2222',
        email: 'john.doe@nexcliiper.io',
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 400 with invalid paylaod', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([partyRoute]);

      const allPartyUser = await request(app.getServer()).get('/party/user').set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      const response = await request(app.getServer())
        .put(`/party/user/${allPartyUser.body.data[0].partyId}`)
        .send({})
        .set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(400);
    });
  });
});
