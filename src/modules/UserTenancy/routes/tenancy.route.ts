import { Router } from 'express';
import TenancyController from '@/modules/UserTenancy/controllers/tenancy.controller';
import TenancyMemberController from '@/modules/UserTenancy/controllers/tenancyMember.controller';
import { CreateTenancyDto } from '@/modules/UserTenancy/dtos/tenancy.dto';
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
    this.router.get('/tenancies', authMiddleware, this.tenancyController.getAllTenancies);
    this.router.get('/tenancies/my', authMiddleware, this.tenancyController.getUserTenancies);
    this.router.post('/tenancies', authMiddleware, validationMiddleware(CreateTenancyDto, 'body'), this.tenancyController.createTenancy);
    this.router.get('/tenancies/:id', authMiddleware, this.tenancyController.getTenancyById);
    this.router.delete('/tenancies/:id', authMiddleware, this.tenancyController.deleteTenancy);
    this.router.put('/tenancies/:id', authMiddleware, this.tenancyController.updateTenancy);
    this.router.put('/current-tenancy/:tenancyId', authMiddleware, this.tenancyMemberController.updateUserCurrentTenancy);

    this.router.get('/tenancies/:tenancyId/members', authMiddleware, this.tenancyMemberController.getAllTenancyMember);
    this.router.delete('/tenancies/:tenancyId/members/:memberId', authMiddleware, this.tenancyMemberController.deleteTenancyMember);
    this.router.get('/tenancies/:tenancyId/members/:memberId', authMiddleware, this.tenancyMemberController.getTenancyMember);

    /*
    RYAN: this is replaced with invitation API
    this.router.post(
      '/tenancies/:tenancyId/members/:userId',
      authMiddleware,
      validationMiddleware(CreateTenancyMemberDto, 'body'),
      this.tenancyController.createTenancyMember,
    );
    */
  }
}

export default TenancyRoute;
