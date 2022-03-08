import { Router } from 'express';
import TenancyController from '@/modules/UserTenancy/controllers/tenancy.controller';
import TenancyMemberController from '@/modules/UserTenancy/controllers/tenancyMember.controller';
import { CreateTenancyDto } from '@/modules/UserTenancy/dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@/modules/UserTenancy/dtos/tenancyMember.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
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
      '/tenancies/:tenancyPk/members/:userPk',
      authMiddleware,
      validationMiddleware(CreateTenancyMemberDto, 'body'),
      this.tenancyController.createTenancyMember,
    );
    this.router.put('/current-tenancy/:tenancyPk', authMiddleware, this.tenancyMemberController.updateTenancyMemberToUser);

    this.router.get('/tenancies/:tenancyPk/members', authMiddleware, this.tenancyController.getAllTenancyMember);
    this.router.delete('/tenancies/:tenancyPk/members', authMiddleware, this.tenancyController.deleteTenancyMember);
    this.router.get('/tenancies/member/:tenancyMemberId', authMiddleware, this.tenancyController.getTenancyMember);
  }
}

export default TenancyRoute;
