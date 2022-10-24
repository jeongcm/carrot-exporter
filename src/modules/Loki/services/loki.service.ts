import { HttpException } from '@/common/exceptions/HttpException';
import config from '@/config';
import axios from 'axios';
import WebSocket, { createWebSocketStream } from 'ws';
class LokiService {
  public async tailLog(query: string): Promise<void> {
    const url = 'ws://localhost:3100/loki/api/v1/tail?query=' + query;
    console.log(url);
    const socket = new WebSocket(url);
    const duplex = createWebSocketStream(socket, { encoding: 'utf8' });
    duplex.pipe(process.stdout);
    process.stdin.pipe(duplex);
  }

  public async queryLog(query: string): Promise<object> {
    let data;
    try {
      const url = config.lokiApiBaseUrl + '/query?query=' + query;
      data = await axios({ method: 'get', url: url });
    } catch (e) {
      throw new HttpException(500, 'Unknown error on Loki query');
    }

    const queryResult = data.data;
    return queryResult;
  }
  public async getLabels(): Promise<object> {
    let data;
    try {
      const url = config.lokiApiBaseUrl + '/labels';
      data = await axios({ method: 'get', url: url });
    } catch (e) {
      throw new HttpException(500, 'Unknown error on Loki labels query');
    }

    const queryResult = data.data;
    return queryResult;
  }
  public async getLabelValues(label: string): Promise<object> {
    let data;
    try {
      const url = config.lokiApiBaseUrl + '/label/' + label + '/values';
      data = await axios({ method: 'get', url: url });
    } catch (e) {
      throw new HttpException(500, 'Unknown error on Loki label value query');
    }
    const queryResult = data.data;
    return queryResult;
  }
}
export default LokiService;
