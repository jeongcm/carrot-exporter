import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import DB from '@/database';
import { Routes } from '@/common/interfaces/routes.interface';
import errorMiddleware from '@/common/middlewares/error.middleware';
import { logger, stream } from '@/common/utils/logger';
import Passport from './modules/UserTenancy/provider/passport';
import { Request, Response, NextFunction } from 'express';
import config from 'config';

// RYAN: for git commit, please do not just use wip, as it's impossible to track it in logs. Please at least mark the ticket number:
// eg: wip: NEX-1123
class App {
  public port: number;
  public env: string;
  public app: express.Application;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = Number(config.appPort);
    this.env = config.nodeEnv;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 NexClipper listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    DB.sequelize
      .sync({ force: false })
      .then(() => {
        console.log('Database connected successfully');
      })
      .catch(err => {
        console.log(err);
      });
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.logFormat, { stream }));
    this.app.use(cors({ origin: config.cors.allowAnyOrigin, credentials: config.cors.credentials }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.intializeMiddlewareLogging();
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      session({
        secret: 'secrettexthere',
        saveUninitialized: false,
        resave: false,
      }),
    );
    this.app = Passport.mountPackage(this.app);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'NEXCLIPPER-NODE API',
          version: '1.0.0',
          description: 'API TESTING',
        },
      },
      apis: ['src/modules/**/swagger/*.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
  private intializeMiddlewareLogging() {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const send = res.send;
      res.send = c => {
        logger.info(`url is ${req.url}`);
        logger.info(`Status code is ${res.statusCode}`);
        logger.info(`Request Body is ${JSON.stringify(req.body || {})}`);
        logger.info(`Response Body is ${c}`);
        res.send = send;
        return res.send(c);
      };
      next();
    });
  }
}

export default App;
