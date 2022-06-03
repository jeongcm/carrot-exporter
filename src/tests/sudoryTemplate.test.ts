import App from '@/app';
import SudoryTemplateRoute from '@/modules/MetricOps/routes/sudoryTemplate.route';
import PartyRoute from '@/modules/Party/routes/party.route';
import { Sequelize } from 'sequelize';
import request from 'supertest';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing SodoryTemplate Module', () => {
  let sudoryTemplate, sudoryTemplateId, token, sudoryTemplateService;
  let sudoryTemplateRoute = new SudoryTemplateRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    sudoryTemplate = sudoryTemplateRoute.sudoryTemplateController.sudoryTemplateService.sudoryTemplate;
    sudoryTemplateService = sudoryTemplateRoute.sudoryTemplateController.sudoryTemplateService;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });
  describe('[POST] /sudoryTemplate - create SudoryTemplate', () => {
    it('return 200 with new SudoryTemplate', async () => {
      const requestPayload = {
        sudoryTemplateName: 'template 1',
        sudoryTemplateDescription: 'this is for testing purpose',
        sudoryTemplateUuid: '100000000000000000000001',
        sudoryTemplateArgs: {
          end: '2022-05-26T05:30:00.000Z',
          query: "rate(container_cpu_usage_seconds_total{pod='gitlab-runner-nc-7884f7c6dc-2jprv'}[5m])",
          start: '2022-05-26T04:30:00.000Z',
          step: '15s',
          url: 'http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090',
        },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([sudoryTemplateRoute]);
      sudoryTemplate.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/sudoryTemplate').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      sudoryTemplateId = res.body.data.sudoryTemplateId;
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        sudoryTemplateName: 'template 1',
        sudoryTemplateDescription: 'this is for testing purpose',
        sudoryTemplateUuid: '100000000000000000000001',
        sudoryTemplateArgs: {
          end: '2022-05-26T05:30:00.000Z',
          query: "rate(container_cpu_usage_seconds_total{pod='gitlab-runner-nc-7884f7c6dc-2jprv'}[5m])",
          start: '2022-05-26T04:30:00.000Z',
          step: '15s',
          url: 'http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090',
        },
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([sudoryTemplateRoute]);
      sudoryTemplate.create = jest.fn().mockReturnValue({ ...requestPayload });
      const res = await request(app.getServer()).post('/sudoryTemplate').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('[GET] /sudoryTemplates - All sudoryTemplates', () => {
    it('returns 200 with found all sudoryTemplates', async () => {
      sudoryTemplate.findAll = jest.fn().mockReturnValue([
        {
          sudoryTemplateKey: 1,
          sudoryTemplateId: 'ST24070300000001',
          createdBy: 'PU24070300000002',
          updatedBy: null,
          createdAt: '2022-06-02T06:20:36.000Z',
          updatedAt: '2022-06-02T06:20:36.000Z',
          deletedAt: null,
          sudoryTemplateName: 'template 1',
          sudoryTemplateDescription: 'this is for testing purpose',
          sudoryTemplateUuid: '100000000000000000000001',
          sudoryTemplateArgs: {
            end: '2022-05-26T05:30:00.000Z',
            query: "rate(container_cpu_usage_seconds_total{pod='gitlab-runner-nc-7884f7c6dc-2jprv'}[5m])",
            start: '2022-05-26T04:30:00.000Z',
            step: '15s',
            url: 'http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090',
          },
        },
      ]);
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([sudoryTemplateRoute]);
      const res = await request(app.getServer()).get('/sudoryTemplates').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[GET] /sudoryTemplate/:sudoryTemplateId -get api by id', () => {
    it('should return 200  with  api by id', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([sudoryTemplateRoute]);
      sudoryTemplate.findOne = jest.fn().mockReturnValue({
        sudoryTemplateKey: 1,
        sudoryTemplateId: 'ST24070300000001',
        createdBy: 'PU24070300000002',
        updatedBy: null,
        createdAt: '2022-06-02T06:20:36.000Z',
        updatedAt: '2022-06-02T06:20:36.000Z',
        deletedAt: null,
        sudoryTemplateName: 'template 1',
        sudoryTemplateDescription: 'this is for testing purpose',
        sudoryTemplateUuid: '100000000000000000000001',
        sudoryTemplateArgs: {
          end: '2022-05-26T05:30:00.000Z',
          query: "rate(container_cpu_usage_seconds_total{pod='gitlab-runner-nc-7884f7c6dc-2jprv'}[5m])",
          start: '2022-05-26T04:30:00.000Z',
          step: '15s',
          url: 'http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090',
        },
      });
      const res = await request(app.getServer()).get(`/sudoryTemplate/${sudoryTemplateId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[PUT] /sudoryTemplate/:sudoryTemplateId - update sudoryTemplate', () => {
    it('should return 200  with  RuleGroup by ruleGroupId', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([sudoryTemplateRoute]);
      const apiDetail = await request(app.getServer()).get(`/sudoryTemplate/${sudoryTemplateId}`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        sudoryTemplateName: 'template 1 edit',
      };
      sudoryTemplate.update = jest.fn().mockReturnValue({});
      sudoryTemplate.findByPk = jest.fn().mockReturnValue({
        sudoryTemplateKey: 1,
        sudoryTemplateId: 'ST24070300000001',
        createdBy: 'PU24070300000002',
        updatedBy: 'PU24070300000002',
        createdAt: '2022-06-02T06:20:36.000Z',
        updatedAt: '2022-06-02T06:40:28.000Z',
        deletedAt: null,
        sudoryTemplateName: 'template 1 edit',
        sudoryTemplateDescription: 'this is for testing purpose',
        sudoryTemplateUuid: '100000000000000000000001',
        sudoryTemplateArgs: {
          end: '2022-05-26T05:30:00.000Z',
          query: "rate(container_cpu_usage_seconds_total{pod='gitlab-runner-nc-7884f7c6dc-2jprv'}[5m])",
          start: '2022-05-26T04:30:00.000Z',
          step: '15s',
          url: 'http://kps-kube-prometheus-stack-prometheus.monitor.svc.cluster.local:9090',
        },
      });
      const res = await request(app.getServer())
        .put(`/sudoryTemplate/${sudoryTemplateId}`)
        .send(requestPayload)
        .set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
