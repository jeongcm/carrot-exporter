import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import PartyRoute from '@/modules/Party/routes/party.route';
import AlertRoute from '@/modules/Alert/routes/alert.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Channel Module', () => {
  let alertRule, alertRuleId, token;
  let alertRoute = new AlertRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    alertRule = alertRoute.alertController.alertRuleService.alertRule;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /alert/rule- create new alert rule', () => {
    it('return 200 with new Alert Rule', async () => {
      const requestPayload = {
        alertRuleName: 'Query: absent(up{job=“kube-controller-manager”} == 1)',
        alertRuleGroup: 'alert group',
        alertRuleQuery: 'Alert Rule query',
        AlertRuleDuration: 3,
        alertRuleSeverity: 'warning',
        alertRuleDescription: 'Alert Rule Description',
        alertRuleRunbook: 'Alert Run book',
        alertRuleSummary: 'Alert Rule Summary',
        alertRuleState: 'inactive',
        alertRuleMlGroup: 'ab',
        alertRuleMlSubGroup: 'xy',
        resourceGroupUuid: 'ABC123',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([alertRoute]);
      alertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/alert/rule').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      alertRuleId = res.body.data.alertRuleId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        alertRuleName: 'Query: absent(up{job=“kube-controller-manager”} == 1)',
        alertRuleGroup: 'alert group',
        alertRuleQuery: 'Alert Rule query',
        AlertRuleDuration: 3,
        alertRuleSeverity: 'warning',
        alertRuleDescription: 'Alert Rule Description',
        alertRuleRunbook: 'Alert Run book',
        alertRuleSummary: 'Alert Rule Summary',
        alertRuleState: 'inactive',
        alertRuleMlGroup: 'ab',
        alertRuleMlSubGroup: 'xy',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([alertRoute]);
      alertRule.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/alert/rule').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    describe('[GET] /alert/rule - All Rules', () => {
      it('returns 200 with found all Rules', async () => {
        alertRule.findAll = jest.fn().mockReturnValue([
          {
            customerAccountKey: 3,
            alertRuleId: 'AL24060600000001',
            createdAt: '2022-05-05T03:34:22.000Z',
            updatedAt: '2022-05-05T03:34:22.000Z',
            alertRuleName: 'Query: absent(up{job=“kube-controller-manager”} == 1)',
            alertRuleGroup: 'alert group',
            alertRuleState: 'inactive',
            alertRuleQuery: 'Alert Rule query',
            alertRuleDuration: null,
            alertRuleSeverity: 'warning',
            alertRuleDescription: 'Alert Rule Description',
            alertRuleSummary: 'Alert Rule Summary',
            alertRuleRunbook: ' Alert Run book',
            alertRuleMlGroup: 'ab',
            alertRuleMlSubGroup: 'xy',
            resourceGroupUuid: 'ABC123',
          },
        ]);
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([alertRoute]);
        const res = await request(app.getServer()).get('/alert/rule').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      });
    });

    describe('[PUT] /alert/rule/:alertRuleId- update AlertRule', () => {
      it('should return 200  with  AlertRule by alertRuleId', async () => {
        (Sequelize as any).authenticate = jest.fn();
        const app = new App([alertRoute]);
        const apiDetail = await request(app.getServer()).get(`/alert/rule/${alertRuleId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
        let requestPayload = {
          alertRuleName: 'Query: absent(up{job=“kube-controller-manager”} == 1)',
          alertRuleGroup: 'modify alert group',
          alertRuleQuery: 'modify Alert Rule query',
          AlertRuleDuration: 34,
          alertRuleSeverity: 'modify warning',
          alertRuleDescription: 'Alert Rule Description',
          alertRuleRunbook: 'modify Alert Run book',
          alertRuleSummary: 'modify Alert Rule Summary',
          alertRuleState: 'inactive',
          alertRuleMlGroup: 'ab',
          alertRuleMlSubGroup: 'xy',
          resourceGroupUuid: 'ABC123',
        };
        alertRule.update = jest.fn().mockReturnValue({});
        alertRule.findByPk = jest.fn().mockReturnValue({
          alertRuleKey: 1,
          customerAccountKey: 3,
          createdAt: '2022-05-05T03:34:22.000Z',
          updatedAt: '2022-05-05T04:55:26.000Z',
          alertRuleName: 'Query: absent(up{job=“kube-controller-manager”} == 1)',
          alertRuleGroup: 'modify alert group',
          alertRuleState: 'inactive',
          alertRuleQuery: 'modify Alert Rule query',
          alertRuleDuration: null,
          alertRuleSeverity: 'modify warning',
          alertRuleDescription: 'Alert Rule Description',
          alertRuleSummary: 'modify Alert Rule Summary',
          alertRuleRunbook: 'modify Alert Run book',
          alertRuleMlGroup: 'ab',
          alertRuleMlSubGroup: 'xy',
          resourceGroupUuid: 'ABC123',
        });
        const res = await request(app.getServer()).put(`/alert/rule/${alertRuleId}`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
      });
    });
  });
});
