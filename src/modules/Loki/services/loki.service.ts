import WebSocket from 'ws';
class LokiService {
  public async tailLog(query: string): Promise<void> {
    const url = 'ws://localhost:3100/loki/api/v1/tail?query=' + query;
    console.log(url);
    const socket = new WebSocket(url);

    socket.onopen = function (event) {
      // Send an initial message
      socket.send("I am the client and I'm listening!");

      // Listen for messages
      socket.onmessage = function (event) {
        console.log('Client received a message', event);
      };

      // Listen for socket closes
      socket.onclose = function (event) {
        console.log('Client notified socket has closed', event);
      };

      // To close the socket....
      socket.close();
    };
  }
}
export default LokiService;
