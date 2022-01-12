import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import passport from 'passport';
import Google from '../services/google.service';
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
  }
}

export default AuthRoute;
