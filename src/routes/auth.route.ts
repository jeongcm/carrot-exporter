import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import SocialController from '@controllers/social.controller';
import Google from '../services/google.service';
import GitHub from '../services/github.services';
var passport  = require('passport');
class AuthRoute implements Routes {
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    console.log('in auth routes', this.router);
    /**
     * @swagger
     * definitions:
     *   signup:
     *      type: object
     *      required:
     *        - username
     *        - email
     *        - loginPw
     *        - firstName
     *        - lastName
     *      properties:
     *        username:
     *          type: string
     *          description: username
     *          example: jaswant
     *        email:
     *          type: string
     *          description: user Email
     *          example: jaswant.test@gmail.com
     *        loginPw:
     *          type: string
     *          description: user Password
     *          example: admin
     *        firstName:
     *          type: string
     *          description: user firstName
     *          example: jaswant
     *        lastName:
     *          type: string
     *          description: user lastname
     *          example: singh
    */
   /**
      * @swagger
      * /signup:
      *  post:
      *    tags: [users]
      *    summary: Add User
      *    parameters:
      *       - name: body
      *         in: body
      *         description: user Data
      *         required: true 
      *         schema:
      *           $ref: '#/definitions/signup'
      *    responses:
      *      201:
      *        description: 'Created'
      *      400:
      *        description: 'Bad Request'
      *      409:
      *        description: 'Conflict'
      *      500:
      *        description: 'Server Error'
    */
    this.router.post('/signup', validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    /**
     * @swagger
     * definitions:
     *   login:
     *     type: object
     *     required:
     *       - email
     *       - loginPw
     *     properties:
     *       email:
     *         type: string
     *         description: user Email
     *         example: jaswant.test@gmail.com
     *       loginPw:
     *          type: string
     *          description: user Password
     *          example: admin
     */
    /**
     * @swagger
     * /login:
     *   post:
     *     tags: [users]
     *     summary: User Login
     *     parameters:
     *       - name: body
     *         in: body
     *         required: true
     *         schema:
     *            $ref: '#/definitions/login'
     *     responses:
     *       200:
     *         description: OK
     *       500:
     *         description: 'Server Error'
     */
    this.router.post('/login', validationMiddleware(LoginUserDto, 'body'), this.authController.logIn);
    this.router.get('/me', authMiddleware, this.authController.info);
    this.router.get('/logout', this.authController.logOut);
    this.router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], failureRedirect: '/login' }));
    this.router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), SocialController.googleCallback);

    this.router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

    this.router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
      return res.status(200).json("successful login");
    });
  }
}

export default AuthRoute;
