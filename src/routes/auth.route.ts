import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import Google from '../services/google.service';
import GitHub from '../services/github.services';
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
    this.router.get('/google', Google.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

    this.router.get('/google/callback', Google.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
      res.redirect('/');
    });
    this.router.get('/github', GitHub.authenticate('github', { session:false, scope: ['user:email'] }));

    this.router.get('/github/callback', GitHub.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
      // Successful authentication, redirect home.
     res.redirect('/users');
    });
  }
}

export default AuthRoute;
