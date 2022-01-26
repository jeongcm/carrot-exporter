import { Router } from 'express';
import TenancyController from '@controllers/tenancy.controller';
import TenancyMemberController from '@controllers/tenancyMember.controller';
import { CreateTenancyDto } from '@dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@dtos/tenancyMember.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';
import authMiddleware from '@middlewares/auth.middleware';
import Passport from 'provider/passport'
class TenancyRoute implements Routes {
  // public path = '/users/tenancies';
  public router = Router();
  public tenancyController = new TenancyController();
  public tenancyMemberController = new TenancyMemberController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get('/tenancie', this.tenancyController.getUserTenancies);
    this.router.post('/tenancies', authMiddleware, validationMiddleware(CreateTenancyDto, 'body'), this.tenancyController.createTenancy);
    this.router.get('/tenancies', authMiddleware, this.tenancyController.getAllTenancies);
    this.router.get('/tenancies/:id', authMiddleware, this.tenancyController.getTenancyById);
    this.router.delete('/tenancies/:id', authMiddleware, this.tenancyController.deleteTenancy);
    this.router.put('/tenancies/:id', authMiddleware, this.tenancyController.updateTenancy);

    this.router.post(
      '/tenancies/:tenancyId/members/:userId',
      authMiddleware,
      validationMiddleware(CreateTenancyMemberDto, 'body'),
      this.tenancyController.createTenancyMember,
    );
    this.router.put(
      '/current-tenancy/:tenancyId',
      authMiddleware,
      this.tenancyMemberController.updateTenancyMemberToUser,
    );

    this.router.get('/tenancies/:tenancyId/members', authMiddleware, this.tenancyController.getAllTenancyMember);
    this.router.delete('/tenancies/:tenancyId/members', authMiddleware, this.tenancyController.deleteTenancyMember);
    this.router.get('/tenancies/member/:tenancyMemberId', authMiddleware, this.tenancyController.getTenancyMember);
  }
}

export default TenancyRoute;
