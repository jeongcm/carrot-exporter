import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import PartyRoute from '@/modules/Party/routes/party.route';
import IncidentRoute from '@/modules/Incident/routes/incident.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Incident Module', () => {
  let incidentRoute, incidentDB, incidentActionDB, incidentActionAttachmentDB, token, userData, app, incidentService;

  beforeAll(async () => {
    incidentRoute = new IncidentRoute();
    let partyRoute = new PartyRoute();
    incidentDB = incidentRoute.incidentController.incidentService.incident;
    incidentActionDB = incidentRoute.incidentController.incidentService.incidentAction;
    incidentActionAttachmentDB = incidentRoute.incidentController.incidentService.incidentActionAttachment;
    incidentService = incidentRoute.incidentController.incidentService;

    app = new App([partyRoute, incidentRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'john.doe@nexclipper.io',
      password: 'Password@123!',
    });

    token = res.body.token;
    userData = res.body.data;
  });

  describe('[POST] /incidents - create a new incident', () => {
    it('return 200 with new plan detail', async () => {
      const requestPayload = {
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        assigneeId: `${userData.partyId}`,
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.320Z',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentDB.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/incidents').send(requestPayload).set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        assigneeId: `${userData.partyId}`,
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.320Z',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentDB.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/incidents').send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        incidentName: '',
        incidentDescription: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentDB.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/incidents').send(requestPayload).set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('[GET] /incidents - get all incident list', () => {
    it('return 200 with new plan detail', async () => {
      incidentDB.findAll = jest.fn().mockReturnValue([
        {
          incidentId: 'IN24060400000009',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T04:12:02.000Z',
          updatedAt: '2022-05-03T04:12:02.000Z',
          incidentName: 'FISRT INCIDENT',
          incidentDescription: 'Description for testing',
          incidentStatus: 'OP',
          incidentSeverity: 'UR',
          incidentDueDate: '2022-05-10T13:10:01.000Z',
          incidentPinned: false,
          assignee: {
            partyId: 'PU24060400000003',
            partyName: 'John Doe',
            partyDescription: 'Head of DBA',
            partyType: 'US',
            PartyUser: {
              partyUserId: 'PU24060400000003',
              firstName: 'John',
              lastName: 'Doe',
              userId: 'john.doe@nexclipper.io',
              mobile: '+1-310-777-8888',
              email: 'john.doe@nexclipper.io',
              lastAccessAt: '2022-05-03T04:11:39.000Z',
            },
          },
        },
        {
          incidentId: 'IN24060400000008',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T04:11:58.000Z',
          updatedAt: '2022-05-03T04:11:58.000Z',
          incidentName: 'FISRT INCIDENT',
          incidentDescription: 'Description for testing',
          incidentStatus: 'OP',
          incidentSeverity: 'UR',
          incidentDueDate: '2022-05-10T13:10:01.000Z',
          incidentPinned: false,
          assignee: {
            partyId: 'PU24060400000003',
            partyName: 'John Doe',
            partyDescription: 'Head of DBA',
            partyType: 'US',
            PartyUser: {
              partyUserId: 'PU24060400000003',
              firstName: 'John',
              lastName: 'Doe',
              userId: 'john.doe@nexclipper.io',
              mobile: '+1-310-777-8888',
              email: 'john.doe@nexclipper.io',
              lastAccessAt: '2022-05-03T04:11:39.000Z',
            },
          },
        },
      ]);

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 401 with unathuorized', async () => {
      incidentDB.findAll = jest.fn().mockReturnValue([
        {
          incidentId: 'IN24060400000009',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T04:12:02.000Z',
          updatedAt: '2022-05-03T04:12:02.000Z',
          incidentName: 'FISRT INCIDENT',
          incidentDescription: 'Description for testing',
          incidentStatus: 'OP',
          incidentSeverity: 'UR',
          incidentDueDate: '2022-05-10T13:10:01.000Z',
          incidentPinned: false,
          assignee: {
            partyId: 'PU24060400000003',
            partyName: 'John Doe',
            partyDescription: 'Head of DBA',
            partyType: 'US',
            PartyUser: {
              partyUserId: 'PU24060400000003',
              firstName: 'John',
              lastName: 'Doe',
              userId: 'john.doe@nexclipper.io',
              mobile: '+1-310-777-8888',
              email: 'john.doe@nexclipper.io',
              lastAccessAt: '2022-05-03T04:11:39.000Z',
            },
          },
        },
        {
          incidentId: 'IN24060400000008',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T04:11:58.000Z',
          updatedAt: '2022-05-03T04:11:58.000Z',
          incidentName: 'FISRT INCIDENT',
          incidentDescription: 'Description for testing',
          incidentStatus: 'OP',
          incidentSeverity: 'UR',
          incidentDueDate: '2022-05-10T13:10:01.000Z',
          incidentPinned: false,
          assignee: {
            partyId: 'PU24060400000003',
            partyName: 'John Doe',
            partyDescription: 'Head of DBA',
            partyType: 'US',
            PartyUser: {
              partyUserId: 'PU24060400000003',
              firstName: 'John',
              lastName: 'Doe',
              userId: 'john.doe@nexclipper.io',
              mobile: '+1-310-777-8888',
              email: 'john.doe@nexclipper.io',
              lastAccessAt: '2022-05-03T04:11:39.000Z',
            },
          },
        },
      ]);

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[GET] /incidents/counts - get numbers of incidents status', () => {
    it('return 200 with number of status', async () => {
      incidentDB.count = jest.fn().mockReturnValue(3);

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/counts').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('All Counts');
    });

    it('return 401 with unathuorized', async () => {
      incidentDB.count = jest.fn().mockReturnValue(3);

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/counts').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[GET] /incidents/:incidentId - get incident by Id', () => {
    it('return 200 with incident detail', async () => {
      incidentDB.findOne = jest.fn().mockReturnValue({
        incidentId: 'IN24060400000009',
        createdBy: 'PU24060400000003',
        updatedBy: null,
        createdAt: '2022-05-03T04:12:02.000Z',
        updatedAt: '2022-05-03T04:12:02.000Z',
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.000Z',
        incidentPinned: false,
        assignee: {
          partyId: 'PU24060400000003',
          partyName: 'John Doe',
          partyDescription: 'Head of DBA',
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060400000003',
            firstName: 'John',
            lastName: 'Doe',
            userId: 'john.doe@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'john.doe@nexclipper.io',
            lastAccessAt: '2022-05-03T04:24:17.000Z',
          },
        },
      });

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/IN24060400000009').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 404 when incident id does not exist', async () => {
      incidentDB.findOne = jest.fn().mockReturnValue(null);

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/IN24060400000009').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('return 401 with unathuorized', async () => {
      incidentDB.findOne = jest.fn().mockReturnValue({
        incidentId: 'IN24060400000009',
        createdBy: 'PU24060400000003',
        updatedBy: null,
        createdAt: '2022-05-03T04:12:02.000Z',
        updatedAt: '2022-05-03T04:12:02.000Z',
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.000Z',
        incidentPinned: false,
        assignee: {
          partyId: 'PU24060400000003',
          partyName: 'John Doe',
          partyDescription: 'Head of DBA',
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060400000003',
            firstName: 'John',
            lastName: 'Doe',
            userId: 'john.doe@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'john.doe@nexclipper.io',
            lastAccessAt: '2022-05-03T04:24:17.000Z',
          },
        },
      });

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/IN24060400000009').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[PUT] /incidents/:incidentId - update incident', () => {
    it('return 200  with  updated incident detail', async () => {
      const updatePayload = {
        incidentName: 'FIRST INCIDENT - EDIT',
        incidentDescription: 'Description for testing - EDIT',
        assigneeId: 'PU245600000002',
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.320Z',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentDB.findOne = jest.fn().mockReturnValue({
        incidentId: 'IN24060400000009',
        createdBy: 'PU24060400000003',
        updatedBy: null,
        createdAt: '2022-05-03T04:12:02.000Z',
        updatedAt: '2022-05-03T04:12:02.000Z',
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.000Z',
        incidentPinned: false,
        assignee: {
          partyId: 'PU24060400000003',
          partyName: 'John Doe',
          partyDescription: 'Head of DBA',
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060400000003',
            firstName: 'John',
            lastName: 'Doe',
            userId: 'john.doe@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'john.doe@nexclipper.io',
            lastAccessAt: '2022-05-03T04:24:17.000Z',
          },
        },
      });

      incidentService.getUserKey = jest.fn();

      incidentDB.update = jest.fn().mockReturnValue({});

      incidentService.getIncidentById = jest.fn().mockReturnValue({
        incidentId: 'IN24060400000009',
        createdBy: 'PU24060400000003',
        updatedBy: null,
        createdAt: '2022-05-03T04:12:02.000Z',
        updatedAt: '2022-05-03T04:12:02.000Z',
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.000Z',
        incidentPinned: false,
        assignee: {
          partyId: 'PU24060400000003',
          partyName: 'John Doe',
          partyDescription: 'Head of DBA',
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060400000003',
            firstName: 'John',
            lastName: 'Doe',
            userId: 'john.doe@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'john.doe@nexclipper.io',
            lastAccessAt: '2022-05-03T04:24:17.000Z',
          },
        },
      });

      const res = await request(app.getServer()).put(`/incidents/IN24060400000009`).send(updatePayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('updated');
    });

    it('return 404 when incident id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer()).get('/incidents/IN24060400000009').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('[DELETE] /incidents/:incidentId - delete incident', () => {
    it('return 204 and incident be deleted when incident exists', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({
        incidentId: 'IN24060400000009',
        createdBy: 'PU24060400000003',
        updatedBy: null,
        createdAt: '2022-05-03T04:12:02.000Z',
        updatedAt: '2022-05-03T04:12:02.000Z',
        incidentName: 'FISRT INCIDENT',
        incidentDescription: 'Description for testing',
        incidentStatus: 'OP',
        incidentSeverity: 'UR',
        incidentDueDate: '2022-05-10T13:10:01.000Z',
        incidentPinned: false,
        assignee: {
          partyId: 'PU24060400000003',
          partyName: 'John Doe',
          partyDescription: 'Head of DBA',
          partyType: 'US',
          PartyUser: {
            partyUserId: 'PU24060400000003',
            firstName: 'John',
            lastName: 'Doe',
            userId: 'john.doe@nexclipper.io',
            mobile: '+1-310-777-8888',
            email: 'john.doe@nexclipper.io',
            lastAccessAt: '2022-05-03T04:24:17.000Z',
          },
        },
      });

      incidentDB.update = jest.fn().mockReturnValue([1]);
      incidentService.getIncidentKey = jest.fn().mockReturnValue({ incidentKey: 1 });
      incidentDB.update = jest.fn().mockReturnValue([1]);

      const res = await request(app.getServer()).delete('/incidents/IN24060400000009').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);
    });

    it('return 404 when incident id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer()).delete('/incidents/IN24060400000009').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('[POST] /incidents/:incidentId/actions - create an action for an incident', () => {
    it('return 200 with an incident action', async () => {
      const requestPayload = {
        incidentActionName: 'action name',
        incidentActionDescription: 'action description',
        incidentActionStatus: 'EX',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer())
        .post('/incidents/IN24060400000009/actions')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        incidentActionName: 'action name',
        incidentActionDescription: 'action description',
        incidentActionStatus: 'EX',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentDB.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/incidents/IN24060400000009/actions').send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        incidentActionName: '',
        incidentActionDescription: '',
        incidentActionStatus: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      const res = await request(app.getServer())
        .post('/incidents/IN24060400000009/actions')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('[GET] /incidents/:incidentId/actions - get all actions of an incident', () => {
    it('return 200 with all incident actions', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.findAll = jest.fn().mockReturnValue([
        {
          incidentActionId: 'IA24060400000001',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T05:04:55.000Z',
          updatedAt: '2022-05-03T05:04:55.000Z',
          incidentActionName: 'newnewnew incident action',
          incidentActionDescription: 'newnewnew description',
          incidentActionStatus: 'EX',
          incidentActionExecutedAt: null,
        },
        {
          incidentActionId: 'IA24060400000003',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T05:43:52.000Z',
          updatedAt: '2022-05-03T05:43:52.000Z',
          incidentActionName: 'newnewnew incident action',
          incidentActionDescription: 'newnewnew description',
          incidentActionStatus: 'EX',
          incidentActionExecutedAt: null,
        },
      ]);

      const res = await request(app.getServer()).get('/incidents/IN24060400000009/actions').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 404 when incident id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer()).get('/incidents/IN24060400000009/actions').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/IN24060400000009/actions').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[PUT] /incidents/:incidentId/actions/:actionId - update an incident action', () => {
    it('return 200 with an incident action', async () => {
      const requestPayload = {
        incidentActionName: 'action name',
        incidentActionDescription: 'action description',
        incidentActionStatus: 'EX',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.update = jest.fn().mockReturnValue([1]);

      incidentActionDB.findOne = jest.fn().mockReturnValue({
        incidentActionId: 'IA24060400000001',
        createdBy: 'PU24060400000003',
        updatedBy: 'PU24060400000003',
        createdAt: '2022-05-03T05:04:55.000Z',
        updatedAt: '2022-05-03T05:58:04.000Z',
        incidentActionName: 'PUT modified',
        incidentActionDescription: 'modified description',
        incidentActionStatus: 'EX',
        incidentActionExecutedAt: null,
      });

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000009/actions/IA24060400000001')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        incidentActionName: 'action name',
        incidentActionDescription: 'action description',
        incidentActionStatus: 'EX',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).put('/incidents/IN24060400000009/actions/IA24060400000001').send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        incidentActionName: '',
        incidentActionDescription: '',
        incidentActionStatus: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000009/actions/IA24060400000001')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });

    it('return 404 when incident id does not exist', async () => {
      const requestPayload = {
        incidentActionName: 'action name',
        incidentActionDescription: 'action description',
        incidentActionStatus: 'EX',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000009/actions/IA24060400000001')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('return 404 when incident action id does not exist', async () => {
      const requestPayload = {
        incidentActionName: 'action name',
        incidentActionDescription: 'action description',
        incidentActionStatus: 'EX',
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.findOne = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000009/actions/IA24060400000001')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('[DELETE] /incidents/:incidentId/actions/:actionId - delete incident action', () => {
    it('return 204 and incident action be deleted when it exists', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.findOne = jest.fn().mockReturnValue({
        incidentActionId: 'IA24060400000001',
        createdBy: 'PU24060400000003',
        updatedBy: 'PU24060400000003',
        createdAt: '2022-05-03T05:04:55.000Z',
        updatedAt: '2022-05-03T06:23:07.000Z',
        incidentActionName: 'PUT modified',
        incidentActionDescription: 'modified description',
        incidentActionStatus: 'EX',
        incidentActionExecutedAt: null,
      });

      incidentActionDB.update = jest.fn().mockReturnValue([1]);

      const res = await request(app.getServer())
        .delete('/incidents/IN24060400000009/actions/IA24060400000001')
        .send()
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);
    });

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).delete('/incidents/IN24060400000009/actions/IA24060400000001').send();

      expect(res.statusCode).toBe(401);
    });

    it('return 404 when incident id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .delete('/incidents/IN24060400000009/actions/IA24060400000001')
        .send()
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('return 404 when incident action id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.findOne = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .delete('/incidents/IN24060400000009/actions/IA24060400000001')
        .send()
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('[POST] /incidents/:incidentId/actions/:actionId/attachment - create an action attachment for an incident', () => {
    it('return 200 with an incident action attachment', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'incidentActionAttachmentName 333 ',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription 333',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'json attachment', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentService.getIncidentActionKey = jest.fn().mockReturnValue(1);

      incidentActionAttachmentDB.create = jest.fn().mockReturnValue({
        incidentActionAttachmentBLOB: null,
        incidentActionAttachmentKey: 2,
        incidentActionAttachmentName: 'incidentActionAttachmentName 333 ',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription 333',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: {
          title: 'json attachment',
          desc: 'json desc',
        },
        createdBy: 'PU24060400000002',
        incidentActionKey: 1,
        incidentActionAttachmentId: 'IT24060400000002',
        updatedAt: '2022-05-03T08:24:16.171Z',
        createdAt: '2022-05-03T08:24:16.171Z',
      });

      const res = await request(app.getServer())
        .post('/incidents/IN24060400000002/actions/IA24060400000001/attachment')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        incidentActionAttachmentName: '',
        incidentActionAttachmentDescription: '',
        incidentActionAttachmentType: '',
        incidentActionAttachmentFilename: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer())
        .post('/incidents/IN24060400000002/actions/IA24060400000001/attachment')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'incidentActionAttachmentName 333 ',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription 333',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'json attachment', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).post('/incidents/IN24060400000002/actions/IA24060400000001/attachment').send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 404 when incident id does not exist', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'incidentActionAttachmentName 333 ',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription 333',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'json attachment', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .post('/incidents/IN24060400000002/actions/IA24060400000001/attachment')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe(`Incident id(IN24060400000002) not found`);
    });

    it('return 404 when incident action id does not exist', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'incidentActionAttachmentName 333 ',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription 333',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'json attachment', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentService.getIncidentActionKey = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .post('/incidents/IN24060400000002/actions/IA24060400000001/attachment')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Incident action id(IA24060400000001) not found');
    });
  });

  describe('[GET] /incidents/:incidentId/actions/:actionId/attachment - get all action attachments of an incident', () => {
    it('return 200 with all incident actions', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentActionDB.findAll = jest.fn().mockReturnValue([
        {
          incidentActionId: 'IA24060400000001',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T05:04:55.000Z',
          updatedAt: '2022-05-03T05:04:55.000Z',
          incidentActionName: 'newnewnew incident action',
          incidentActionDescription: 'newnewnew description',
          incidentActionStatus: 'EX',
          incidentActionExecutedAt: null,
        },
        {
          incidentActionId: 'IA24060400000003',
          createdBy: 'PU24060400000003',
          updatedBy: null,
          createdAt: '2022-05-03T05:43:52.000Z',
          updatedAt: '2022-05-03T05:43:52.000Z',
          incidentActionName: 'newnewnew incident action',
          incidentActionDescription: 'newnewnew description',
          incidentActionStatus: 'EX',
          incidentActionExecutedAt: null,
        },
      ]);

      const res = await request(app.getServer()).get('/incidents/IN24060400000009/actions').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 404 when incident id does not exist', async () => {
      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer()).get('/incidents/IN24060400000009/actions').send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it('return 401 with unathuorized', async () => {
      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer()).get('/incidents/IN24060400000009/actions').send();

      expect(res.statusCode).toBe(401);
    });
  });

  describe('[PUT] /incidents/:incidentId/actions/:actionId/attachment/:attachmentId - update an action attachment for an incident', () => {
    it('return 200 with updated incident action attachment', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'update update',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription222',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'update', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentService.getIncidentActionByActionId = jest.fn().mockReturnValue({
        incidentActionAttachmentKey: 4,
        incidentActionAttachmentId: 'IT24060400000011',
        incidentActionKey: 5,
        createdBy: 'PU24060400000002',
        updatedBy: null,
        createdAt: '2022-05-03T14:14:41.000Z',
        updatedAt: '2022-05-03T14:14:41.000Z',
        deletedAt: null,
        incidentActionAttachmentName: 'incidentActionAttachmentName 333 ',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription 333',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentBLOB: null,
        incidentActionAttachmentJSON: {
          title: 'json attachment',
          desc: 'json desc',
        },
      });

      incidentActionAttachmentDB.update = jest.fn().mockReturnValue([1]);

      incidentService.getIncidentActionKey = jest.fn().mockReturnValue(1);

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000013/actions/IA24060400000013/attachment/IT24060400000011')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        incidentActionAttachmentName: '',
        incidentActionAttachmentDescription: '',
        incidentActionAttachmentType: '',
        incidentActionAttachmentFilename: '',
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000013/actions/IA24060400000013/attachment/IT24060400000011')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'update update',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription222',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'update', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000013/actions/IA24060400000013/attachment/IT24060400000011')
        .send(requestPayload);

      expect(res.statusCode).toBe(401);
    });

    it('return 404 when incident id does not exist', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'update update',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription222',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'update', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000013/actions/IA24060400000013/attachment/IT24060400000011')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Incident id(IN24060400000013) not found');
    });

    it('return 404 when incident action id does not exist', async () => {
      const requestPayload = {
        incidentActionAttachmentName: 'update update',
        incidentActionAttachmentDescription: 'incidentActionAttachmentDescription222',
        incidentActionAttachmentType: 'JS',
        incidentActionAttachmentFilename: 'incidentActionAttachmentFilename',
        incidentActionAttachmentJSON: { title: 'update', desc: 'json desc' },
      };

      (Sequelize as any).authenticate = jest.fn();

      incidentService.getIncidentById = jest.fn().mockReturnValue({});

      incidentService.getIncidentActionByActionId = jest.fn().mockReturnValue(null);

      const res = await request(app.getServer())
        .put('/incidents/IN24060400000013/actions/IA24060400000013/attachment/IT24060400000011')
        .send(requestPayload)
        .set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Incident Action id(IA24060400000013) not found');
    });
  });
});
