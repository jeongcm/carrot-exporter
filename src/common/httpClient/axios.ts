import axios from 'axios';
import http from 'http';
import https from 'https';

const newAxios = axios.create({
  //60 sec timeout
  timeout: 60 * 1000,

  //keepAlive pools and reuses TCP connections, so it's faster
  httpAgent: new http.Agent({
    // TODO: make it configurable
    maxSockets: 100,
    maxFreeSockets: 10,
    keepAlive: true,
  }),
  httpsAgent: new https.Agent({
    // TODO: make it configurable
    maxSockets: 100,
    maxFreeSockets: 10,
    keepAlive: true,
  }),
});

export default newAxios;
