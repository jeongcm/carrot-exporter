import { Router } from 'express';
const passport = require('passport');
import { Routes } from '@/common/interfaces/routes.interface';
import { SocialLoginEnum } from '@/common/enums';
import SocialLoginController from '../controllers/socialLogin.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class SocialLoginRoutes implements Routes {
  public router = Router();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
   this.router.get('/login/failed', (req, res)=>{
     res.status(402).json({
       success: false,
       message: 'failuer'
     })
   })
   this.router.get('/login/success', (req, res)=>{
     res.status(200).json({
       success: false,
       message: 'failuer',
       user:req.user
     })
   })
    this.router.get('/auth/google' ,passport.authenticate('google', { scope: ['email', 'profile'], failureRedirect: '/login' }));
    this.router.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login/failed' , successRedirect:'http://localhost:3000/clusters/dashboards/list'})
    );
    // Google Auth: END

    // Github Auth: START
    this.router.get('/auth/github', systemAuthMiddleware, passport.authenticate('github', { scope: ['user:email'] }));
    this.router.get(
      '/auth/github/callback',systemAuthMiddleware,
      passport.authenticate('github', { failureRedirect: '/login' }),
      SocialLoginController.loginSuccessCallback(SocialLoginEnum.GITHUB),
    );
    // Github Auth: END
  }
}

export default SocialLoginRoutes;
