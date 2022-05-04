import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import PartyRoute from '@/modules/Party/routes/party.route';
import CustomerAccountRoute from '@/modules/CustomerAccount/routes/customerAccount.route';
import ResourceRoute from '@/modules/Resources/routes/resource.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Party Module', () => {
  let partyRoute,
    partyDB,
    partyUserDB,
    partyRelationDB,
    customerAccountDB,
    resourceDB,
    partyResourceDB,
    partyUserLogsDB,
    partyService,
    customerAccountService,
    token,
    userData,
    app;

  beforeAll(async () => {
    partyRoute = new PartyRoute();
    const customerAccountRoute = new CustomerAccountRoute();

    partyDB = partyRoute.partyController.partyService.party;
    partyUserDB = partyRoute.partyController.partyService.partyUser;
    partyRelationDB = partyRoute.partyController.partyService.partyRelation;
    customerAccountDB = customerAccountRoute.customerAccountController.customerAccountService.customerAccount;
    resourceDB = partyRoute.partyController.partyService.resource;
    partyResourceDB = partyRoute.partyController.partyService.partyResource;
    partyUserLogsDB = partyRoute.partyController.partyService.partyUserLogs;

    partyService = partyRoute.partyController.partyService;
    customerAccountService = customerAccountRoute.customerAccountController.customerAccountService;

    app = new App([partyRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'john.doe@nexclipper.io',
      password: 'Password@123!',
    });

    token = res.body.token;
    userData = res.body.data;
  });

  describe('[POST] /login', () => {
    it('returns 200 with user information', async () => {
      const loginAccount = { userId: 'operator@nexclipper.io', password: 'Password@123!' };

      (Sequelize as any).authenticate = jest.fn();

      const login = await request(app.getServer()).post('/login').send(loginAccount);

      expect(login.statusCode).toBe(200);
    });

    it('returns 409 when login with invalid user', async () => {
      const invalidAccount = { userId: 'operator@nexclipper.io', password: 'InvalidPassword!' };

      (Sequelize as any).authenticate = jest.fn();

      const login = await request(app.getServer()).post('/login').send(invalidAccount);

      expect(login.statusCode).toBe(409);
    });
  });

  describe('[POST] /party/user - create a new user (party,partyUser)', () => {
    it('return 200 with new user detail', async () => {
      const requestPayload = {
        customerAccountId: `${userData.customerAccountId}`,
        userId: 'test@gmail.com',
        password: 'Password@123!',
        partyName: 'Test Doe',
        partyDescription: 'Head of DBA',
        firstName: 'Test',
        lastName: 'Doe',
        mobile: '+1-310-777-8888',
        email: 'test@gmail.com',
        partyUserStatus: 'AC',
      };

      (Sequelize as any).authenticate = jest.fn();

      customerAccountDB.findOne = jest.fn().mockReturnValue({ customerAccountKey: 2 });

      partyDB.create = jest.fn().mockReturnValue({
        partyKey: 4,
        partyId: 'PU24060500000004',
        partyName: 'John Doe',
        partyDescription: 'Head of DBA',
        parentPartyId: undefined,
        partyType: 'US',
        customerAccountKey: 2,
        createdBy: 'PU24060400000001',
        updatedAt: ' 2022-05-03T00:51:27.425Z',
        createdAt: '2022-05-03T00:51:27.425Z',
      });

      partyUserDB.create = jest.fn().mockReturnValue({
        partyUserKey: 4,
        partyUserId: 'PU24060500000004',
        partyKey: 4,
        createdBy: 'PU24060400000001',
        firstName: 'Test',
        lastName: 'Doe',
        userId: 'test@gmail.com',
        mobile: '+1-310-777-8888',
        password: '$2b$10$r.lkd3eGLF.4guhJH6CZMOYM3oqo6dAiDtbOOcZtcO.MvPcXG3uEu',
        email: 'test@gmail.com',
        isEmailValidated: false,
        partyUserStatus: 'AC',
        updatedAt: ' 2022-05-03T00:51:27.425Z',
        createdAt: '2022-05-03T00:51:27.425Z',
      });

      const res = await request(app.getServer()).post('/party/user').send(requestPayload).set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        customerAccountId: '',
        userId: '',
        password: '',
        partyName: '',
        firstName: '',
        lastName: '',
        partyUserStatus: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).post('/party/user').send(requestPayload).set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  // fail -- start
  describe('[GET] /party/user - get all user list', () => {
    it('return 200 with all user list', async () => {
      partyDB.findAll = jest.fn().mockReturnValue([
        {
          partyId: 'PU24060500000002',
          createdBy: 'PU24060500000001',
          updatedBy: null,
          createdAt: '2022-05-04T01:09:54.000Z',
          updatedAt: '2022-05-04T01:09:54.000Z',
          partyName: 'John Doe',
          partyDescription: 'Head of DBA',
          parentPartyId: null,
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060500000002',
            createdBy: 'PU24060500000001',
            updatedBy: null,
            createdAt: '2022-05-04T01:09:54.000Z',
            updatedAt: '2022-05-04T01:35:14.000Z',
            firstName: 'John',
            lastName: 'Doe',
            userId: 'john.doe@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'john.doe@nexclipper.io',
            partyUserStatus: 'AC',
            isEmailValidated: false,
            emailValidatedAt: null,
            token: null,
            lastAccessAt: '2022-05-04T01:35:14.000Z',
          },
        },
        {
          partyId: 'PU24060500000006',
          createdBy: 'PU24060500000001',
          updatedBy: null,
          createdAt: '2022-05-04T01:37:46.000Z',
          updatedAt: '2022-05-04T01:37:46.000Z',
          partyName: 'Test',
          partyDescription: 'Head of DBA',
          parentPartyId: null,
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060500000006',
            createdBy: 'PU24060500000001',
            updatedBy: null,
            createdAt: '2022-05-04T01:37:46.000Z',
            updatedAt: '2022-05-04T01:37:46.000Z',
            firstName: 'Test',
            lastName: 'test',
            userId: 'test@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'test@nexclipper.io',
            partyUserStatus: 'AC',
            isEmailValidated: false,
            emailValidatedAt: null,
            token: null,
            lastAccessAt: null,
          },
        },
      ]);

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/party/user').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });
  // fail -- end

  describe('[GET] /party/user/:partyId - get partyUser by Id', () => {
    it('return 200 with incident detail', async () => {
      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue({
        partyId: 'PU24060500000002',
        createdBy: 'PU24060500000001',
        updatedBy: null,
        createdAt: '2022-05-04T01:09:54.000Z',
        updatedAt: '2022-05-04T01:09:54.000Z',
        partyName: 'John Doe',
        partyDescription: 'Head of DBA',
        parentPartyId: null,
        partyType: 'US',
        PartyUser: {
          partyUserId: 'PU24060500000002',
          createdBy: 'PU24060500000001',
          updatedBy: null,
          createdAt: '2022-05-04T01:09:54.000Z',
          updatedAt: '2022-05-04T01:38:23.000Z',
          firstName: 'John',
          lastName: 'Doe',
          userId: 'john.doe@nexclipper.io',
          mobile: '+1-310-777-8888',
          email: 'john.doe@nexclipper.io',
          partyUserStatus: 'AC',
          isEmailValidated: false,
          emailValidatedAt: null,
          token: null,
          lastAccessAt: '2022-05-04T01:38:23.000Z',
        },
      });

      const res = await request(app.getServer()).get('/party/user/PU24060500000002').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/party/user/PU24060500000002').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[PUT] /party/user/:partyUserId - update partyUser', () => {
    it('return 200 with updated partyUser detail', async () => {
      const updatePayload = {
        partyName: 'James Lee',
        partyDescription: 'Head of OPS',
        firstName: 'James',
        lastName: 'Lee',
        mobile: '+1-310-333-2222',
        email: 'james@nexcliiper.io',
        partyUserStatus: 'AC',
      };

      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue({
        partyId: 'PU24060500000006',
        createdBy: 'PU24060500000001',
        updatedBy: 'PU24060500000002',
        createdAt: '2022-05-04T01:37:46.000Z',
        updatedAt: '2022-05-04T01:54:27.000Z',
        partyName: 'James Lee --modified',
        partyDescription: 'Head of OPS --modified',
        parentPartyId: null,
        partyType: 'US',
        PartyUser: {
          partyUserId: 'PU24060500000006',
          createdBy: 'PU24060500000001',
          updatedBy: 'PU24060500000002',
          createdAt: '2022-05-04T01:37:46.000Z',
          updatedAt: '2022-05-04T01:54:27.000Z',
          firstName: 'James',
          lastName: 'Lee',
          userId: 'test@nexclipper.io',
          mobile: '+1-310-333-2222',
          email: 'james@nexcliiper.io',
          partyUserStatus: 'AC',
          isEmailValidated: false,
          emailValidatedAt: null,
          token: null,
          lastAccessAt: null,
        },
      });

      partyDB.update = jest.fn().mockReturnValue([1]);
      partyUserDB.update = jest.fn().mockReturnValue([1]);

      const res = await request(app.getServer()).put(`/party/user/PU24060500000006`).send(updatePayload).set(`x-authorization`, `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('updated');
    });

    it('return 400 with invalid payload', async () => {
      const updatePayload = {
        partyName: '',
        partyDescription: '',
        firstName: '',
        lastName: '',
        partyUserStatus: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).put(`/party/user/PU24060500000006`).send(updatePayload).set(`x-authorization`, `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('[POST] /party/accessgroup - create an accessgroup', () => {
    it('return 200 with an accessgroup', async () => {
      const requestPayload = {
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
      };

      (Sequelize as any).authenticate = jest.fn();

      partyDB.create = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        partyType: 'AG',
        createdBy: 'PU24060500000002',
        createdAt: '2022-05-04T02:06:23.872Z',
        updatedAt: '2022-05-04T02:06:23.872Z',
      });

      const res = await request(app.getServer()).post('/party/accessgroup').send(requestPayload).set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
      };

      (Sequelize as any).authenticate = jest.fn();

      partyDB.create = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        partyType: 'AG',
        createdBy: 'PU24060500000002',
        createdAt: '2022-05-04T02:06:23.872Z',
        updatedAt: '2022-05-04T02:06:23.872Z',
      });

      const res = await request(app.getServer()).post('/party/accessgroup').send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        partyName: '',
        partyDescription: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).post('/party/accessgroup').send(requestPayload).set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('[GET] /party/accessgroup - get all accessgroups', () => {
    it('return 200 with all accessgroups', async () => {
      (Sequelize as any).authenticate = jest.fn();

      partyDB.findAll = jest.fn().mockReturnValue([
        {
          partyId: 'PT24060500000001',
          createdBy: 'PU24060500000002',
          updatedBy: null,
          createdAt: '2022-05-04T02:06:23.000Z',
          updatedAt: '2022-05-04T02:06:23.000Z',
          partyName: 'FrontEnd',
          partyDescription: 'Team of Frontend',
          parentPartyId: null,
          partyType: 'AG',
        },
        {
          partyId: 'PT24060500000003',
          createdBy: 'PU24060500000002',
          updatedBy: null,
          createdAt: '2022-05-04T02:09:47.000Z',
          updatedAt: '2022-05-04T02:09:47.000Z',
          partyName: 'BackEnd',
          partyDescription: 'Team of BackEnd',
          parentPartyId: null,
          partyType: 'AG',
        },
      ]);

      const res = await request(app.getServer()).get('/party/accessgroup').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/party/accessgroup').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[GET] /party/accessgroup/:partyId - get an accessgroup detail', () => {
    // fail -- start
    it('return 200 with an accessgroup detail', async () => {
      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: ' 2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      const res = await request(app.getServer()).get('/party/accessgroup/PT24060500000001').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 404 when party id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer()).get('/party/accessgroup/PT24060500000001').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
    // fail -- end

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/party/accessgroup/PT24060500000001').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[PUT] /party/accessgroup/:partyId - update an accessgroup', () => {
    // fail -- start
    it('return 200 with an accessgroup', async () => {
      const requestPayload = {
        partyName: 'FE',
        partyDescription: 'Team of FrontEnd',
      };

      (Sequelize as any).authenticate = jest.fn();

      jest.setTimeout(50000);

      partyDB.findOne = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyDB.update = jest.fn().mockReturnValue([1]);

      const res = await request(app.getServer())
        .put('/party/accessgroup/PT24060500000001')
        .send(requestPayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
    // fail -- end

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        partyName: 'FE',
        partyDescription: 'Team of FrontEnd',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).put('/party/accessgroup/PT24060500000001').send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        partyName: '',
        partyDescription: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer())
        .put('/party/accessgroup/PT24060500000001')
        .send(requestPayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });

    // fail -- start
    it('return 404 when accessgroup does not exist', async () => {
      const requestPayload = {
        partyName: '',
        partyDescription: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .put('/party/accessgroup/PT24060500000001')
        .send(requestPayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
    // fail -- end
  });

  describe('[POST] /party/accessgroup/:partyId/users - add user to the accessgroup', () => {
    it('return 200 with result', async () => {
      const requestPayload = {
        partyIds: ['PU24060500000002', 'PU24060500000006'],
      };

      (Sequelize as any).authenticate = jest.fn();

      partyService.getAccessGroup = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyDB.findOne = jest.fn().mockReturnValue({
        partyKey: 4,
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyDB.findAll = jest.fn().mockReturnValue([{ partyKey: 2 }, { partyKey: 3 }]);

      partyRelationDB.bulkCreate = jest.fn().mockReturnValue([
        {
          partyRelationKey: 1,
          partyRelationId: 'PR24060500000001',
          partyParentKey: 4,
          partyChildKey: 2,
          createdBy: 'PU24060500000002',
          partyRelationType: 'AU',
          partyRelationFrom: '2022-05-04T02:58:25.769Z',
          partyRelationTo: '2022-05-04T02:58:25.769Z',
          createdAt: '2022-05-04T02:58:25.769Z',
          updatedAt: '2022-05-04T02:58:25.769Z',
        },
        {
          partyRelationKey: 2,
          partyRelationId: 'PR24060500000002',
          partyParentKey: 4,
          partyChildKey: 3,
          createdBy: 'PU24060500000002',
          partyRelationType: 'AU',
          partyRelationFrom: '2022-05-04T02:58:25.769Z',
          partyRelationTo: '2022-05-04T02:58:25.769Z',
          createdAt: '2022-05-04T02:58:25.769Z',
          updatedAt: '2022-05-04T02:58:25.769Z',
        },
      ]);

      const res = await request(app.getServer())
        .post('/party/accessgroup/PT24060500000001/users')
        .send(requestPayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 404 when accessGroup does not exist', async () => {
      const requestPayload = {
        partyIds: ['PU24060500000002', 'PU24060500000006'],
      };

      partyService.getAccessGroup = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .post('/party/accessgroup/PT24060500000001/users')
        .send(requestPayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.body.message).toBe("AccessGroup (id: PT24060500000001)  doesn't exist");
      expect(res.statusCode).toBe(404);
    });
  });

  describe('[GET] /party/accessgroup/:partyId/users - get all users of the accessgroup', () => {
    it('return 200 with users of the accessgroup', async () => {
      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyRelationDB.findAll = jest.fn().mockReturnValue([
        {
          partyRelationId: 'PR24060500000001',
          createdBy: 'PU24060500000002',
          updatedBy: null,
          createdAt: '2022-05-04T02:58:25.000Z',
          updatedAt: '2022-05-04T02:58:25.000Z',
          partyRelationType: 'AU',
          partyRelationFrom: '2022-05-04T02:58:25.000Z',
          partyRelationTo: '2022-05-04T02:58:25.000Z',
          partyChild: {
            partyId: 'PU24060500000002',
            partyName: 'John Doe',
            partyDescription: 'Head of DBA',
            partyType: 'US',
            PartyUser: {
              partyUserId: 'PU24060500000002',
              firstName: 'John',
              lastName: 'Doe',
              userId: 'john.doe@nexclipper.io',
              mobile: '+1-310-777-8888',
              email: 'john.doe@nexclipper.io',
              lastAccessAt: '2022-05-04T03:04:31.000Z',
            },
          },
        },
      ]);

      const res = await request(app.getServer()).get('/party/accessgroup/PT24060500000001/users').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/party/accessgroup/PT24060500000001/users').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[DELETE] /party/accessgroup/:partyId/users - delete user from accessgroup', () => {
    it('return 204 and user be deleted from accessgroup', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const deletePayload = {
        partyIds: ['PU24060500000002'],
      };

      partyService.getAccessGroup = jest.fn().mockReturnValue({
        partyKey: '3',
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyDB.findOne = jest.fn().mockReturnValue({
        partyKey: '3',
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyDB.findAll = jest.fn().mockReturnValue([{}, {}]);

      partyRelationDB.update = jest.fn().mockReturnValue([1]);

      const res = await request(app.getServer())
        .delete('/party/accessgroup/PT24060500000001/users')
        .send(deletePayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);
    });
  });

  describe('[POST] /party/accessgroup/:partyId/resource - add resource to accessgroup', () => {
    it('return 201 with an accessgroup', async () => {
      const requestPayload = {
        resourceIds: ['RE24052600000001'],
      };

      (Sequelize as any).authenticate = jest.fn();

      partyDB.findOne = jest.fn().mockReturnValue({
        partyKey: '3',
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      resourceDB.findAll = jest.fn().mockReturnValue([{}, {}]);

      partyResourceDB.findAll = jest.fn().mockReturnValue(null);

      partyResourceDB.bulkCreate = jest.fn().mockReturnValue([{}, {}]);

      const res = await request(app.getServer())
        .post('/party/accessgroup/PT24060500000001/resource')
        .send(requestPayload)
        .set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
    });
  });

  describe('[GET] /party/:partyId/apilog', () => {
    it('return 200 with user api logs', async () => {
      partyService.getUser = jest.fn().mockReturnValue({
        partyId: 'PU24060500000002',
        createdBy: 'PU24060500000001',
        updatedBy: null,
        createdAt: '2022-05-04T01:09:54.000Z',
        updatedAt: '2022-05-04T01:09:54.000Z',
        partyName: 'John Doe',
        partyDescription: 'Head of DBA',
        parentPartyId: null,
        partyType: 'US',
        PartyUser: {
          partyUserId: 'PU24060500000002',
          createdBy: 'PU24060500000001',
          updatedBy: null,
          createdAt: '2022-05-04T01:09:54.000Z',
          updatedAt: '2022-05-04T06:07:33.000Z',
          firstName: 'John',
          lastName: 'Doe',
          userId: 'john.doe@nexclipper.io',
          mobile: '+1-310-777-8888',
          email: 'john.doe@nexclipper.io',
          partyUserStatus: 'AC',
          isEmailValidated: false,
          emailValidatedAt: null,
          token: null,
          lastAccessAt: '2022-05-04T06:07:33.000Z',
        },
      });

      partyUserDB.findOne = jest.fn().mockReturnValue({ partyUserKey: 2 });

      partyUserLogsDB.findAll = jest.fn().mockReturnValue([
        {
          partyUserLogsId: 'PL24060500000041',
          createdBy: 'PU24060500000002',
          updatedBy: null,
          createdAt: '2022-05-04T01:37:57.000Z',
          updatedAt: '2022-05-04T01:37:57.000Z',
          deletedAt: null,
          Api: {
            apiId: 'AP24060500000011',
            createdBy: 'SYSTEM',
            updatedBy: null,
            createdAt: '2022-05-04T01:09:05.000Z',
            updatedAt: '2022-05-04T01:09:05.000Z',
            deletedAt: null,
            apiName: 'getUsers',
            apiDescription: 'get all partyUser in the same customer account.',
            apiEndPoint1: 'GET',
            apiEndPoint2: '/party/user',
            apiVisibleTF: true,
          },
        },
        {
          partyUserLogsId: 'PL24060500000046',
          createdBy: 'PU24060500000002',
          updatedBy: null,
          createdAt: '2022-05-04T01:39:34.000Z',
          updatedAt: '2022-05-04T01:39:34.000Z',
          deletedAt: null,
          Api: {
            apiId: 'AP24060500000011',
            createdBy: 'SYSTEM',
            updatedBy: null,
            createdAt: '2022-05-04T01:09:05.000Z',
            updatedAt: '2022-05-04T01:09:05.000Z',
            deletedAt: null,
            apiName: 'getUsers',
            apiDescription: 'get all partyUser in the same customer account.',
            apiEndPoint1: 'GET',
            apiEndPoint2: '/party/user',
            apiVisibleTF: true,
          },
        },
      ]);

      const res = await request(app.getServer()).get(`/party/${userData.partyId}/apilog`).send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('[GET] /party/accessgroup/:partyId/resource', () => {
    it('return 200 with resources of Accessgroup', async () => {
      (Sequelize as any).authenticate = jest.fn();

      partyService.getAccessGroup = jest.fn().mockReturnValue({
        partyId: 'PT24060500000001',
        createdBy: 'PU24060500000002',
        updatedBy: null,
        createdAt: '2022-05-04T02:06:23.000Z',
        updatedAt: '2022-05-04T02:06:23.000Z',
        partyName: 'FrontEnd',
        partyDescription: 'Team of Frontend',
        parentPartyId: null,
        partyType: 'AG',
      });

      partyDB.findOne = jest.fn().mockReturnValue({ partyKey: 4 });

      partyResourceDB.findAll = jest
        .fn()
        .mockReturnValue([{ Resource: { resourceId: 'RE24052600000001' } }, { Resource: { resourceId: 'RE24052600000002' } }]);

      const res = await request(app.getServer()).get('/party/accessgroup/PT24060500000001/resource').send().set('x-authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
