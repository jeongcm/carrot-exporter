/*
Auth Routes
*/
import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import SocialLoginController from '@/controllers/socialLogin.controller';
import { SocialLoginEnum } from 'enums';

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
