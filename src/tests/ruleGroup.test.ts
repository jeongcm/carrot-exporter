import App from '@/app';
import RuleGroupRoute from '@/modules/MetricOps/routes/ruleGroup.route';
import PartyRoute from '@/modules/Party/routes/party.route';
import { Sequelize } from 'sequelize';
import request from 'supertest';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing MetricOps RuleGroup Module', () => {
  let ruleGroup, ruleGroupId, token, ruleGroupService;
  let ruleGroupRoute = new RuleGroupRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    ruleGroup = ruleGroupRoute.ruleGroupController.ruleGroupService.ruleGroup;
    ruleGroupService = ruleGroupRoute.ruleGroupController.ruleGroupService;
    // alertRule = alertRoute.alertController.alertRuleService.alertRule;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /rule/group - create new Rule Group', () => {
    it('return 200 with new Rule Group', async () => {
      const requestPayload = {
        ruleGroupName: 'Rule Group Name',
        ruleGroupDescription: 'AC',
        ruleGroupStatus: 'AC',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupRoute]);
      ruleGroup.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/rule/group').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      ruleGroupId = res.body.data.ruleGroupId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        ruleGroupName: 'Rule Group Name',
        ruleGroupDescription: 'AC',
        ruleGroupStatus: 'AC',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupRoute]);
      ruleGroup.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/rule/group').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('[GET] /rule/group - All RuleGroup', () => {
    it('returns 200 with found all Rules', async () => {
      ruleGroup.findAll = jest.fn().mockReturnValue([
        {
          ruleGroupKey: 1,
          ruleGroupId: 'RP24062800000001',
          createdAt: '2022-05-27T06:03:16.000Z',
          updatedAt: '2022-05-27T06:03:16.000Z',
          ruleGroupName: 'Rule Group Name',
          ruleGroupDescription: 'AC',
          ruleGroupStatus: 'AC',
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupRoute]);
      const res = await request(app.getServer()).get('/rule/group').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[PUT] /rule/group/:ruleGroupId - update RuleGroup', () => {
    it('should return 200  with  RuleGroup by ruleGroupId', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupRoute]);
      const apiDetail = await request(app.getServer()).get(`/rule/group/${ruleGroupId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        ruleGroupName: 'new Rule Group Name',
        ruleGroupDescription: 'OD',
        ruleGroupStatus: 'OD',
      };
      ruleGroup.update = jest.fn().mockReturnValue({});
      ruleGroup.findByPk = jest.fn().mockReturnValue({
        ruleGroupKey: 2,
        ruleGroupId: 'RP24063100000002',
        createdAt: '2022-05-30T17:05:04.000Z',
        updatedAt: '2022-05-30T17:07:35.000Z',
        ruleGroupName: 'new Rule Group Name',
        ruleGroupDescription: 'OD',
        ruleGroupStatus: 'OD',
      });
      const res = await request(app.getServer()).put(`/rule/group/${ruleGroupId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[DELETE] /rule/group/:ruleGroupId - delete ruleGroup', () => {
    it('return 204 and incident be deleted when ruleGroup exists', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupRoute]);
      ruleGroupService.getRuleGroupById = jest.fn().mockReturnValue({
        ruleGroupKey: 2,
        ruleGroupId: 'RP24063100000002',
        createdAt: '2022-05-30T17:05:04.000Z',
        updatedAt: '2022-05-30T17:07:35.000Z',
        ruleGroupName: 'new Rule Group Name',
        ruleGroupDescription: 'OD',
        ruleGroupStatus: 'OD',
      });

      ruleGroup.update = jest.fn().mockReturnValue([1]);
      ruleGroupService.getRuleGroupById = jest.fn().mockReturnValue({ ruleGroupId: ruleGroupId });
      ruleGroup.update = jest.fn().mockReturnValue([1]);

      const res = await request(app.getServer()).delete(`/rule/group/${ruleGroupId}`).send().set('X-AUTHORIZATION', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);
    });
  });
});
