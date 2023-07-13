import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
//import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import { Routes } from '@common/interfaces/routes.interface';
import errorMiddleware from '@common/middlewares/error.middleware';
import { logger, stream } from '@common/utils/logger';
import express, { Request, Response, NextFunction } from 'express';
import config from '@config/index';
import http from 'http';
//import { registerDecorator } from 'class-validator';
import responseTime from 'response-time';

class App {
  public port: number;
  public env: string;
  public app: express.Application;
  private server: http.Server;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = Number(config.appPort);
    this.env = config.nodeEnv;
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // this.initializeErrorHandling();
  }

  public listen() {
    this.server = this.app.listen(this.port, function () {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${config.nodeEnv} =======`);
      logger.info(`🚀 Claion Aggregator listening on the port ${config.appPort}`);
      logger.info(`=================================`);
    });

    require('console-stamp')(console, {
      format: '(console).yellow :date().green.underline :label(7)',
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  public getHttpServer(): http.Server {
    return this.server;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.logFormat, { stream }));
    this.app.use(cors({ origin: config.cors.allowAnyOrigin, credentials: config.cors.credentials }));
    this.app.use(compression());
    this.app.use(express.json({ limit: config.maxApiBodySize }));
    this.intializeMiddlewareLogging();
    this.app.use(express.urlencoded({ extended: true, limit: config.maxApiBodySize }));
    // this.app.use(cookieParser());
    // this.app.use(
    //   session({
    //     secret: 'secrettexthere',
    //     saveUninitialized: true,
    //     resave: true,
    //     // cookie: { secure: true },
    //     maxAge: 24 * 60 * 60 * 100,
    //   }),
    // );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
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

        if (config.logger.silenceResponse !== true) {
          if ('password' in req.body) {
            const req_new_body = req.body;
            req_new_body.password = '********';
            // logger.info(`Request Body is ${JSON.stringify(req_new_body || {})}`);
          } else {
            // logger.info(`Request Body is ${JSON.stringify(req.body || {})}`);
          }
          logger.info(`Response Body is ${c}`);
        }
        res.send = send;
        return res.send(c);
      };
      next();
    });
  }
}

export default App;
