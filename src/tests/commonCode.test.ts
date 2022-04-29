import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
const jwt = require('jsonwebtoken');
import CommonCodeRoute from '@/modules/CommonCode/routes/commonCode.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('API Endpoints', () => {
  test('[POST] /commonCode', async () => {
    const jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue('Some decoded token');
    const commonCodeRoute = new CommonCodeRoute();
    const commonCode = commonCodeRoute.commonCodeController.commonCodeService.commonCode;

    const requestPayload = {
      commonCodeDescription: 'example',
      commonCodeDisplayENG: 'example',
      commonCodeDisplayKOR: 'example',
    };
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([commonCodeRoute]);
    commonCode.create = jest.fn().mockReturnValue({ ...requestPayload });
    const res = await request(app.getServer()).post('/commonCode').send(requestPayload);
    expect(res.statusCode).toEqual(201);
  });

  test('[PUT] /commonCode', async () => {
    const jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue('Some decoded token');
    const commonCodeRoute = new CommonCodeRoute();
    const commonCode = commonCodeRoute.commonCodeController.commonCodeService.commonCode;
    const requestPayload = {
      commonCodeDescription: 'example',
      commonCodeDisplayENG: 'example',
      commonCodeDisplayKOR: 'example',
    };
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([commonCodeRoute]);
    commonCode.create = jest.fn().mockReturnValue({ ...requestPayload });
    const res = await request(app.getServer()).put('/commonCode/CC245600000002').send(requestPayload);
    expect(res.statusCode).toEqual(201);
  });

  test('list all commonCodes created', async () => {
    const commonCodeRoute = new CommonCodeRoute();
    const jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue('Some decoded token');
    const commonCode = commonCodeRoute.commonCodeController.commonCodeService.commonCode;
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([commonCodeRoute]);
    const res = await request(app.getServer()).get('/commonCode').send().set(`X-AUTHORIZATION`, `sesefsdfsdfsdf`);
    expect(res.statusCode).toEqual(200);
  });

  test('should get  commonCode by id', async () => {
    const route = new CommonCodeRoute();
    const commonCode = route.commonCodeController.commonCodeService.commonCode;
    (Sequelize as any).authenticate = jest.fn();
    const app = new App([route]);
    const res = await request(app.getServer()).get('/commonCode/CC245600000002').send().set(`X-AUTHORIZATION`, `sesefsdfsdfsdf`);
    expect(res.statusCode).toEqual(200);
  });
});
