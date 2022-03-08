/*
Auth Routes
*/
import { Router } from 'express';
import AuthController from '@/modules/UserTenancy/controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '@/modules/UserTenancy/dtos/user.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import SocialLoginController from '@/modules/UserTenancy/controllers/socialLogin.controller';
import { SocialLoginEnum } from '@/common/enums';

const passport = require('passport');
class AuthRoute implements Routes {
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/me', authMiddleware, this.authController.getCurrentUser);

    // Native Auth: START
    this.router.post('/signup', validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.post('/login', validationMiddleware(LoginUserDto, 'body'), this.authController.logIn);
    this.router.get('/logout', this.authController.logOut);
    // Native Auth: END

    // Google Auth: START
    this.router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], failureRedirect: '/login' }));
    this.router.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      SocialLoginController.loginSuccessCallback(SocialLoginEnum.GOOGLE),
    );
    // Google Auth: END

    // Github Auth: START
    this.router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
    this.router.get(
      '/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/login' }),
      SocialLoginController.loginSuccessCallback(SocialLoginEnum.GITHUB),
    );
    // Github Auth: END
  }
}

export default AuthRoute;
