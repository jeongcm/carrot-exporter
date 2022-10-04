import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
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
import Passport from './modules/SocialLogin/providers/passport';
import WebSocket, { createWebSocketStream } from 'ws';
//import { Duplex } from 'winston-daily-rotate-file';
//import { DiagConsoleLogger } from '@opentelemetry/api';
import { PassThrough } from 'stream';
//import { chunk } from 'lodash';
//import { PassThrough } from 'stream';
//import PassThrough from 'stream';
//import { setInternalBufferSize } from 'bson';
//import passport from 'passport';
//import { createServer } from 'http';

class App {
  public port: number;
  public wsPort: number;
  public env: string;
  public app: express.Application;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = Number(config.appPort);
    this.wsPort = Number(config.appWsPort);
    this.env = config.nodeEnv;
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    const server = this.app.listen(this.port, function () {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 NexClipper API listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
    require('console-stamp')(console, {
      format: '(console).yellow :date().green.underline :label(7)',
    });
    /*
    const socketServer = require('ws').Server;
    const wss = new socketServer({ server: server, path: '/loki/v1/tail' });

    wss.on('connection', async function (ws) {
      console.log('Conncted to Websocket Server ...');
      ws.send('Message From server at: ' + new Date());

      const url = 'ws://localhost:3100/loki/api/v1/tail?query=app="nexclipper-api"}';
      const lokiSocket = new WebSocket(url);
      const duplex = createWebSocketStream(lokiSocket, { encoding: 'utf8' });
      streamToString(duplex, cb => {
        ws.send('feeding loki log');
        ws.send(cb);
      });
      

      lokiSocket.on('open', function open(message) {
        console.log('connected to Loki WS', message);
      });
      lokiSocket.on('messeage', function message(message) {
        console.log('got loki messagse', message);
        ws.send(message);
      });
      lokiSocket.on('close', function close(event) {
        console.log('disconncetd to Loki WS', event);
      });

      ws.on('message', function incoming(message) {
        console.log('Received Client Message: %s', message);
        //connectedUsers.push(message);
      });
      ws.on('disconnect', function () {
        console.log('connection droped');
      });
    });
    */
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
        saveUninitialized: true,
        resave: true,
        // cookie: { secure: true },
        maxAge: 24 * 60 * 60 * 100,
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
          title: 'NEXCLIPPER-API',
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

        if (config.logger.silenceResponse !== true) {
          if ('password' in req.body) {
            const req_new_body = req.body;
            req_new_body.password = '********';
            logger.info(`Request Body is ${JSON.stringify(req_new_body || {})}`);
          } else {
            logger.info(`Request Body is ${JSON.stringify(req.body || {})}`);
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

async function streamToString(stream, cb) {
  const chunks = [];
  stream.on('data', chunks => {
    chunks.push(chunks.toString());
  });
  stream.on('end', () => {
    cb(chunks.join(''));
  });
}

export default App;
