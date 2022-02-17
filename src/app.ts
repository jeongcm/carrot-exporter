process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

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
const passport = require('passport');
import DB from 'databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import Passport from './provider/passport';
import { Request, Response, NextFunction } from 'express';

class App {
  public app: express.Application;
  public port: number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = Number(process.env.PORT) || 5000;
    this.env = process.env.NX_NODE_ENV || 'development';

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
    let logFormat = process.env.NX_NODE_LOG_FORMAT
    this.app.use(morgan(process.env.NX_NODE_LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: Boolean(process.env.NX_NODE_CORS_ORIGIN), credentials: process.env.NX_NODE_CORS_CREDENTIALS==="true"  }));
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
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
  private intializeMiddlewareLogging() {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      let send = res.send;
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
