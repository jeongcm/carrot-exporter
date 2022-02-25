import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import SendMailController from '@controllers/sendMail.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class UsersRoute implements Routes {
  public path = '/';
  public router = Router();
  public usersController = new UsersController();
  public sendMailController = new SendMailController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * definitions:
     *   getAllUsers:
     *     type: array
     *     items:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *           description: user uuid
     *           example: f9e28e11-08f1-4a35-b6c4-330531e36fd3
     *         email:
     *           type: string
     *           description: user Email
     *           example: jaswant.test@gmail.com
     *         username:
     *           type: string
     *           description: username
     *           example: jaswant
     *         firstName:
     *            type: string
     *            description: user firstName
     *            example: jaswant
     *         lastName:
     *            type: string
     *            description: user lastname
     *            example: singh
     *         mobile:
     *            type: string
     *            description: user mobile number
     *            example: 732947349
     *         photo:
     *            type: string
     *            description: user profile photo
     *            example: image1
    */
    /**
      * @swagger
      * /users:
      *  get:
      *    tags: [users]
      *    summary: Find All Users
      *    responses:
      *      '200':
      *         description: OK
      *         schema:
      *             $ref: '#/definitions/getAllUsers'
      *      '500':
      *          description: Server Error
    */
    this.router.get('/users', this.usersController.getUsers);
    this.router.get('/users/:id(\\d+)', this.usersController.getUserById);
    this.router.post('/users', validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put('/users/:id(\\d+)', validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete('/users/:id(\\d+)', this.usersController.deleteUser);
    this.router.post('/users/sendMail', this.sendMailController.processMail);
    this.router.get('/verify', this.usersController.verifyMail);
    this.router.post('/users/duplicateMail', this.usersController.checkForDuplicateMail);
    this.router.post('/recoverPassword',authMiddleware, this.usersController.recoverPassword);
    this.router.post('/password_reset', this.usersController.resetPassword);
  }
}

export default UsersRoute;
