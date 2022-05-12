import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import CustomerAccountRoute from '@/modules/CustomerAccount/routes/customerAccount.route';

import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing CustomerAccount Module', () => {
  let customerAccountRoute;
  let customerAccountDB;
  let loginUser;

  beforeAll(async () => {
    customerAccountRoute = new CustomerAccountRoute();
    customerAccountDB = customerAccountRoute.customerAccountController.customerAccountService.customerAccount;

    loginUser = await getLoginUserAccount();
  });

  describe('[GET] /customerAccount - All customerAccount', () => {
    it('returns 200 with found all customeraccounts', async () => {
      customerAccountDB.findAll = jest.fn().mockReturnValue([
        {
          customerAccountId: 'CA24052900000001',
          createdBy: 'PU24052900000001',
          updatedBy: null,
          createdAt: '2022-04-28T04:55:25.000Z',
          updatedAt: '2022-04-28T04:55:25.000Z',
          customerAccountName: 'NEXCLIPPER INC',
          customerAccountDescription: 'Internal Account',
          parentCustomerAccountId: null,
          customerAccountType: 'IA',
        },
        {
          customerAccountId: 'CA24052900000002',
          createdBy: 'PU24052900000001',
          updatedBy: null,
          createdAt: '2022-04-28T04:55:54.000Z',
          updatedAt: '2022-04-28T04:55:54.000Z',
          customerAccountName: 'COS',
          customerAccountDescription: null,
          parentCustomerAccountId: null,
          customerAccountType: null,
        },
      ]);

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([customerAccountRoute]);
      const response = await request(app.getServer()).get('/customerAccount');

      expect(response.statusCode).toBe(200);
    });
  });

  describe('[GET] /customerAccount/:customerAccountId - a customerAccount', () => {
    it('returns the customerAccount if it exists', async () => {
      const requestPayload = {
        customerAccountName: 'TEST',
      };

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([customerAccountRoute]);

      const newCustomerAccount = await request(app.getServer()).post('/customerAccount').send(requestPayload);

      const response = await request(app.getServer()).get(`/customerAccount/${newCustomerAccount.body.data.customerAccountId}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('[POST] /customerAccount - Create customerAccount ', () => {
    it('returns 201 and the created customerAccount', async () => {
      const requestPayload = {
        customerAccountName: 'TEST',
      };

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([customerAccountRoute]);
      const response = await request(app.getServer()).post('/customerAccount').send(requestPayload);

      expect(response.statusCode).toBe(201);
    });

    it('returns 400 when a customerAccountName is invalid', async () => {
      const requestPayload = {
        customerAccountName: 111,
      };

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([customerAccountRoute]);

      const response = await request(app.getServer()).post('/customerAccount').send(requestPayload);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('[PUT] /customerAccount/:customerAccountId - Update customerAccount ', () => {
    it('returns 200 and the updated customerAccount', async () => {
      //   const loginUser = await getLoginUserAccount();

      const updatePayload = {
        customerAccountName: 'NEXCLIPPER INC',
      };

      (Sequelize as any).authenticate = jest.fn();

      const app = new App([customerAccountRoute]);

      const response = await request(app.getServer())
        .put(`/customerAccount/${loginUser.customerAccountId}`)
        .send(updatePayload)
        .set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(200);
    });

    it('returns 401 for the request without Authorization', async () => {
      const updatePayload = {
        customerAccountName: 'modify',
      };

      (Sequelize as any).authenticate = jest.fn();
      const app = new App([customerAccountRoute]);

      const response = await request(app.getServer()).put('/customerAccount/CA00000000000000').send(updatePayload);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('[POST] /customerAccount/:customerAccountId/address - Add customerAccount address', () => {
    it('returns 200 and update an adress belongs to the customerAccount', async () => {
      //   const loginUser = await getLoginUserAccount();

      const addressPayload = {
        addr1: '400 Continental Blvd 6F El Segundo newnewnew',
        city: 'city',
        state: 'CA',
        country: 'USA',
        zipcode: '123456',
        addressName: 'for test address',
      };

      (Sequelize as any).authenticate = jest.fn();

      const app = new App([customerAccountRoute]);

      const response = await request(app.getServer())
        .post(`/customerAccount/${loginUser.customerAccountId}/address`)
        .send(addressPayload)
        .set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(200);
    });

    it('returns 400 when a address payload is invalid', async () => {
      //   const loginUser = await getLoginUserAccount();

      const invalidPayload = {};

      (Sequelize as any).authenticate = jest.fn();

      const app = new App([customerAccountRoute]);

      const response = await request(app.getServer())
        .post(`/customerAccount/${loginUser.customerAccountId}/address`)
        .send(invalidPayload)
        .set(`X-AUTHORIZATION`, `Bearer ${loginUser.token}`);

      expect(response.statusCode).toBe(400);
    });
  });
});

export async function getLoginUserAccount() {
  const loginAccount = { userId: 'john.doe@nexclipper.io', password: 'Password@123!' };

  const app = new App([new CustomerAccountRoute(), new PartyRoute()]);

  const login = await request(app.getServer()).post('/login').send(loginAccount);
  const customerAccount = await request(app.getServer()).get('/customerAccount');

  return {
    ...login.body.data,
    token: login.body.token,
    customerAccountId: customerAccount.body.data[0].customerAccountId,
  };
}
