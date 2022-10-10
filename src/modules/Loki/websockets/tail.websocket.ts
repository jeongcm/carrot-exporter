import queryString from 'query-string';
import parseUrl from 'parseurl';
import WebSocket from 'ws';
import uniqid from 'uniqid';
import http from 'http';
import { logger, stream } from '@common/utils/logger';

const initTailLokiWebsocket = (server: http.Server) => {
  const wsConnections = {};
  const url = 'ws://localhost:3100/loki/api/v1/tail?query={app="nexclipper-api"}';
  const lokiSocket = new WebSocket(url);

  try {
    lokiSocket.onmessage = (event: WebSocket.MessageEvent) => {
      Object.values(wsConnections).forEach((ws: any) => {
        ws.send(event.data);
      });
    }
  } catch (e) {
    console.error(e);
  }

  const socketServer = require('ws').Server;
  const wss = new socketServer({ server: server, path: '/ws/loki/api/v1/tail' });
  wss.on('connection', async function (ws, req) {
    const id = uniqid();
    ws.id = id;
    ws.updateReq = req;

    const parsed = parseUrl(req);
    if (!parsed || !parsed.query || !parsed.clusterId) {
      logger.error(`Missing clusterId or Loki query`);
      ws.close();
    }

    const parsedQuery = queryString.parse(parsed.query);
    console.log(parsedQuery);

    wsConnections[id] = ws;
    ws.on('disconnect', function () {
      delete wsConnections[ws.id];
    });
  });
}

export default initTailLokiWebsocket;
