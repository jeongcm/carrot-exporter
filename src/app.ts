
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import sdk from '@/common/monitoring/tracing';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
//import DB from '@/database';
import { Routes } from '@/common/interfaces/routes.interface';
import errorMiddleware from '@/common/middlewares/error.middleware';
import { logger, stream } from '@/common/utils/logger';
import Passport from './modules/UserTenancy/provider/passport';
import { Request, Response, NextFunction } from 'express';
import config from '@config/index';
//import sqlInjection from 'sql-injection';

sdk.start();
class App {
  
  public port: number;
  public env: string;
  public app: express.Application;
  

  constructor(routes: Routes[]) {
    
    this.app = express();
    this.port = Number(config.appPort);
    this.env = config.nodeEnv;

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
    require('console-stamp')(console, {
      format: '(console).yellow :date().green.underline :label(7)',
    });

    //const listEndpoints = require ("express-list-endpoints")
    //console.log(listEndpoints(this.app));
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.logFormat, { stream }));
    this.app.use(cors({ origin: config.cors.allowAnyOrigin, credentials: config.cors.credentials }));
    //this.app.use(sqlInjection);
    this.app.use(hpp({ whitelist: ['resourceType', 'query', 'metricReceivedName'] }));
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: config.maxApiBodySize }));
    this.intializeMiddlewareLogging();
    this.app.use(express.urlencoded({ extended: true, limit: config.maxApiBodySize }));
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
