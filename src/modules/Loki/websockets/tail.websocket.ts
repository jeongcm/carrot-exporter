import queryString from 'query-string';
import parseUrl from 'parseurl';
import WebSocket from 'ws';
import uniqid from 'uniqid';
import http from 'http';
import { logger, stream } from '@common/utils/logger';
import config from '@/config';

interface ILokiWsConnection {
  ws: WebSocket;
  connections: {
    [key: string]: WebSocket;
  };
}

const initTailLokiWebsocket = (server: http.Server) => {
  const wsConnections = {};
  const lokiWsConnections: { [key: string] : ILokiWsConnection } = {};
  const socketServer = require('ws').Server;
  const wss = new socketServer({ server: server, path: '/ws/loki/api/v1/tail' });

  wss.on('connection', async function (ws, req) {
    try {
      const id = uniqid();
      ws.id = id;
      ws.updateReq = req;
      const parsed = parseUrl(req);
      const parsedQuery = queryString.parse(parsed.query);
      const lokiWsConnectionId = `${parsedQuery.clusterId}:${parsedQuery.query}`;

      // STEP 1. Declare the disconnect event for the ws connection first
      ws.on('disconnect', function () {
        console.log(`ws disconnected: ${ws.id}`);
        delete wsConnections[ws.id];

        // STEP 1-1. when all connections within a specific Loki ws connection
        // we disconnect that specific Loki ws Connection.
        if (lokiWsConnections[lokiWsConnectionId]) {
          delete lokiWsConnections[lokiWsConnectionId].connections[ws.id];
          if (Object.keys(lokiWsConnections[lokiWsConnectionId].connections).length === 0) {
            lokiWsConnections[lokiWsConnectionId].ws.close();
            delete lokiWsConnections[lokiWsConnectionId];
          }
        }
      });

      // STEP 2. Interpret req.query
      if (!parsed || !parsedQuery.query || typeof parsedQuery.clusterId === 'undefined') {
        logger.error(`Missing clusterId or Loki query`);
        ws.close();
        return;
      }

      // STEP 3. establish or reuse the existing loki socket connection
      if (!lokiWsConnections[lokiWsConnectionId]) {
        lokiWsConnections[lokiWsConnectionId] = {
          ws: new WebSocket(`${config.lokiApiBaseUrl}/tail?query=${parsed.query}`),
          connections: {},
        };
        console.log(`New Loki ws connected: ${lokiWsConnectionId}`);
      }

      console.log(`new ws connection ${ws.id} subscribed to Loki connections ${lokiWsConnectionId}`);
      lokiWsConnections[lokiWsConnectionId].connections[ws.id] = ws;

      // STEP 4. overriding existing ws onmessage
      lokiWsConnections[lokiWsConnectionId].ws.onmessage = (event: WebSocket.MessageEvent) => {
        Object.values(lokiWsConnections[lokiWsConnectionId].connections).forEach((ws: any) => {
          ws.send(event.data);
        });
      };

      wsConnections[id] = ws;
    } catch (e) {
      console.error(e);
    }
  });
}

export default initTailLokiWebsocket;
