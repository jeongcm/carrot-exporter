import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import SocialController from '@controllers/social.controller'
import Google from '../services/google.service';
import GitHub from '../services/github.services';
import passport from 'passport';
class AuthRoute implements Routes {
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/signup', validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.post('/login', validationMiddleware(LoginUserDto, 'body'), this.authController.logIn);
    this.router.get('/me', authMiddleware, this.authController.info);
    this.router.get('/logout', this.authController.logOut);
    // router.get('/account', Passport.isAuthenticated, AccountController.index);

    this.router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], failureRedirect: '/login' }));
    this.router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),SocialController.googleCallback)
   
    this.router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

    this.router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
      // Successful authentication, redirect home.
     return res.redirect('/');
    });
  }
}

export default AuthRoute;
