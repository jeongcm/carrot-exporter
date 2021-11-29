import { Router } from 'express';
import TenancyController from '@controllers/tenancy.controller';
import { CreateTenancyDto } from '@dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@dtos/tenancyMember.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';

class UsersRoute implements Routes {
  public path = '/users/tenancies';
  public router = Router();
  public tenancyController = new TenancyController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get(`${this.path}`, this.tenancyController.getUserTenancies);
    this.router.post(
      `${this.path}`,
      this.authservice.authenticate,
      validationMiddleware(CreateTenancyDto, 'body'),
      this.tenancyController.createTenancy,
    );
    this.router.get(`${this.path}`, this.authservice.authenticate, this.tenancyController.getAllTenancies);
    this.router.get(`${this.path}/:id`, this.authservice.authenticate, this.tenancyController.getTenancyById);
    this.router.delete(`${this.path}/:id`, this.authservice.authenticate, this.tenancyController.deleteTenancy);
    this.router.put(`${this.path}/:id`, this.authservice.authenticate, this.tenancyController.updateTenancy);

    this.router.post(
      `${this.path}/:tenancyId/members/:userId`,
      this.authservice.authenticate,
      validationMiddleware(CreateTenancyMemberDto, 'body'),
      this.tenancyController.createTenancyMember,
    );
    // this.router.put(
    //   `${this.path}/:tenancyId/members/:userId`,
    //   this.authservice.authenticate,
    //   validationMiddleware(updateTenancyMemberDto, 'body'),
    //   this.tenancyController.createTenancyMember,
    // );

    this.router.get(`${this.path}/:tenancyId/members`, this.authservice.authenticate, this.tenancyController.getAllTenancyMember);
    this.router.delete(`${this.path}/:tenancyId/members`, this.authservice.authenticate, this.tenancyController.deleteTenancyMember);

    this.router.get(`${this.path}/member/:tenancyMemberId`, this.authservice.authenticate, this.tenancyController.getTenancyMember);
  }
}

export default UsersRoute;
