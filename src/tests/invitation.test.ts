import { Sequelize } from 'sequelize';
import request from 'supertest';
import App from '@/app';
import InvitationRoute from '@/modules/Party/routes/invitation.route';
import PartyRoute from '@/modules/Party/routes/party.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Invitation Module', () => {
  let invitation, token;
  let invitationRoute = new InvitationRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    invitation = invitationRoute.invitationController.invitationService.invitations;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });

  describe('[POST] /invitation/email- create new invitation', () => {
    it('return 200 with new invitation', async () => {
      const requestPayload = {
        messageId: 1,
        invitedTo: 'shrishti.raj@exubers.com',
        customMsg: 'testing1',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.create = jest.fn().mockReturnValue({ message: 'Successfully Invitation Sent' });
      const res = await request(app.getServer()).post('/invitation/email').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });

    it('return 401 with unathuorized', async () => {
      const requestPayload = {
        messageId: 1,
        invitedTo: 'shrishti.raj@exubers.com',
        customMsg: 'testing1',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.create = jest.fn().mockReturnValue({ message: 'Successfully Invitation Sent' });
      const res = await request(app.getServer()).post('/invitation/email').send(requestPayload);

      expect(res.statusCode).toEqual(401);
    });

    it('return 400 with Validation error', async () => {
      const requestPayload = {
        customMsg: 'testing1',
      };
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.create = jest.fn().mockReturnValue({ message: 'Successfully Invitation Sent' });
      const res = await request(app.getServer()).post('/invitation/email').send(requestPayload).set('x-authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('[GET] /invitation/accept -  accept invitation', () => {
    it('should return 200  invitation accepted', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.findInvitationData = jest.fn().mockReturnValue({
        message: 'VERIFICATION_DONE_SUCCESSFULLY',
      });
      const res = await request(app.getServer()).get(`/invitation/accept?token=${token}`).send();
      expect(res.statusCode).toEqual(200);
    });
    it('should return 400 with accepting error', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.findOne = jest.fn().mockReturnValue({
        message: 'Error while accepting  invitation',
      });
      const res = await request(app.getServer()).get(`/invitation/accept?token=${token}`).send();
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('[GET] /invitation/email - check for invitation', () => {
    it('returns 200 with not found email', async () => {
      invitation.findAll = jest.fn().mockReturnValue({
        message: `Invitation for this mail, doesn't exist`,
      });
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      const res = await request(app.getServer()).get('/invitation/email?email=shrishti.raj@exubers.com').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
    it('returns 200 with found invited to email', async () => {
      invitation.findAll = jest.fn().mockReturnValue({
        message: 'Invitation existed',
      });
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      const res = await request(app.getServer()).get('/invitation/email?email=shrishti.raj@exubers.com').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
    it('returns 400 with error while checking for invitation ', async () => {
      invitation.findAll = jest.fn().mockReturnValue({
        message: 'Error while checking for invitation',
      });
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      const res = await request(app.getServer()).get('/invitation/email?email=shrishti.raj@exubers.com').send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('[PUT] /invitation/email- update invitation', () => {
    it('should return 400  not a existed invitation', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      const apiDetail = await request(app.getServer()).get(`/invitation/email`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        email: 'other.mail@exubers.com',
      };
      invitation.update = jest.fn().mockReturnValue({});
      invitation.findByPk = jest.fn().mockReturnValue({
        message: `Invitation  doesn't exist`,
      });
      const res = await request(app.getServer()).put(`/invitation/email`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
    it('should return 200  with  updated invitation', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      const apiDetail = await request(app.getServer()).get(`/invitation/email`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        email: 'shrishti.raj@exubers.com',
      };
      invitation.update = jest.fn().mockReturnValue({});
      invitation.findByPk = jest.fn().mockReturnValue({
        message: 'Successfully Invitation Sent',
      });
      const res = await request(app.getServer()).put(`/invitation/email`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    });
    it('should return 400  with error while updating', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      const apiDetail = await request(app.getServer()).get(`/invitation/email`).send().set(`X-AUTHORIZATION`, `Bearer ${token}`);
      let requestPayload = {
        email: '',
      };
      invitation.update = jest.fn().mockReturnValue({});
      invitation.findByPk = jest.fn().mockReturnValue({
        message: 'Error while updating invitation',
      });
      const res = await request(app.getServer()).put(`/invitation/email`).send(requestPayload).set(`X-AUTHORIZATION`, `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
    });
  });
});

describe('Testing Invitation Module', () => {
  let invitation, token;
  let invitationRoute = new InvitationRoute();

  beforeAll(async () => {
    let partRoute = new PartyRoute();
    invitation = invitationRoute.invitationController.invitationService.invitations;

    const app = new App([partRoute]);

    const res = await request(app.getServer()).post('/login').send({
      userId: 'shrishti.raj@gmail.com',
      password: 'Password@123!',
    });

    token = res.body.token; // save the token!
  });

  describe('[GET] /invitation/reject -  reject invitation', () => {
    it('should return 200  with invalid token', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.findOne = jest.fn().mockReturnValue({
        message: 'TOKEN_IS_INVALID',
      });
      const res = await request(app.getServer()).get(`/invitation/reject?token=${token}`).send();
      expect(res.statusCode).toEqual(200);
    });
    it('should return 200 with already accepted', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation.findOne = jest.fn().mockReturnValue({
      });
      const res = await request(app.getServer()).get(`/invitation/reject?token=${token}`).send();
      expect(res.statusCode).toEqual(200);
    });
    it('should return 200  invitation rejected', async () => {
      (Sequelize as any).authenticate = jest.fn();
      const app = new App([invitationRoute]);
      invitation = jest.fn().mockReturnValue({
        message: 'REQUEST_IS_REJECTED_SUCCESSFULLY',
      });
      const res = await request(app.getServer()).get(`/invitation/reject?token=${token}`).send();
      expect(res.statusCode).toEqual(200);
    });
  });
});
