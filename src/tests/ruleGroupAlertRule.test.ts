import App from '@/app';
import RuleGroupAlertRoute from '@/modules/MetricOps/routes/ruleGroupAlertRule.route';
import PartyRoute from '@/modules/Party/routes/party.route';
import { Sequelize } from 'sequelize';
import request from 'supertest';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
});

describe('Testing MetricOps RuleGroupAlertRoute Module', () => {
  let ruleGroupAlertRule, ruleGroupAlertRuleId, token, ruleGroupAlertRuleService, unregisterMessage, ruleGroupResolutionActionId;
  let ruleGroupAlertRoute = new RuleGroupAlertRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    ruleGroupAlertRule = ruleGroupAlertRoute.ruleGroupAlertRuleController.ruleGroupAlertRuleService.ruleGroupAlertRule;
    ruleGroupAlertRuleService = ruleGroupAlertRoute.ruleGroupAlertRuleController.ruleGroupAlertRuleService;
    // alertRule = alertRoute.alertController.alertRuleService.alertRule;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /register/alert/rule - create new Rule Group', () => {
    it('return 201 with new Rule Group', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24063200000006',
        alertRuleId: 'AL24063200000001',
        ruleGroupAlertRuleStatus: 'AC',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/register/alert/rule').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      ruleGroupAlertRuleId = res.body.data.ruleGroupAlertRuleId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24063200000006',
        alertRuleId: 'AL24063200000001',
        ruleGroupAlertRuleStatus: 'AC',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/register/alert/rule').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });
  describe('[GET] /register/alert/rule - List Rigster AlertRule', () => {
    it('returns 200 with found all Register AlertRule', async () => {
      ruleGroupAlertRule.findAll = jest.fn().mockReturnValue([
        {
          ruleGroupAlertRuleKey: 2,
          ruleGroupKey: 1,
          alertRuleKey: 1,
          ruleGroupAlertRuleStatus: 'AC',
          ruleGroupAlertRuleId: 'RR24063200000002',
          createdAt: '2022-05-31T06:21:00.755Z',
          createdBy: 'PU24062800000002',
          updatedAt: '2022-05-31T06:21:00.756Z',
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      const res = await request(app.getServer()).get('/register/alert/rule').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe('[POST] /unregister/alert/rule - Unregister Alert Rule', () => {
    it('return 201 while unregister Alert Rule', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24063200000006',
        alertRuleId: 'AL24063200000001',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/unregister/alert/rule').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      unregisterMessage = res.body.data.message;
    });

    it('return 204 with unathuorized', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24063200000006',
        alertRuleId: 'AL24063200000001',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/unregister/alert/rule').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });
  describe('[POST] /register/resolution/action - Register Resolution Action', () => {
    it('return 201 with new Register Resolution Action', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24062800000001',
        resolutionActionId: 'RP24062800000002',
        resolutionActionDescription: 'description',
        sudoryTemplateArgsOption: { key: 'value' },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/register/resolution/action').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      ruleGroupResolutionActionId = res.body.data.ruleGroupResolutionActionId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24062800000001',
        resolutionActionId: 'RP24062800000002',
        resolutionActionDescription: 'description',
        sudoryTemplateArgsOption: { key: 'value' },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/register/resolution/action').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('[GET] /register/resolution/action - List Rigster Resolution Action', () => {
    it('returns 200 with found all Register Resolution Action', async () => {
      ruleGroupAlertRule.findAll = jest.fn().mockReturnValue([
        {
          ruleGroupAlertRuleKey: 1,
          ruleGroupKey: 1,
          alertRuleKey: 1,
          ruleGroupAlertRuleId: 'RR24062600000001',
          createdAt: '2022-05-25T14:24:35.000Z',
          updatedAt: '2022-05-25T14:24:35.000Z',
          ruleGroupAlertRuleStatus: 'AC',
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      const res = await request(app.getServer()).get('/register/resolution/action').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe('[POST] /unregister/resolution/action - Unregister Alert Rule', () => {
    it('return 201 while unregister Alert Rule', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24062800000001',
        resolutionActionId: 'RP24062800000002',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/unregister/resolution/action').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      unregisterMessage = res.body.data.message;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        ruleGroupId: 'RP24062800000001',
        resolutionActionId: 'RP24062800000002',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([ruleGroupAlertRoute]);
      ruleGroupAlertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/unregister/resolution/action').send(requestPayload);

      expect(res.statusCode).toEqual(204);
    });
  });
});
