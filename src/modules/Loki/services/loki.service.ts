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
}
export default LokiService;
