
const { WebSocketServer } = require('ws');

/**
 * A web-socket server that listens to new connections and creates users to add to the sessions.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class WSServer
{
    /**
     * Creates a new Web-Socket Server.
     * @param {DEDA.AllGames.Core.Engine} engine - Reference to the game engine.
     */
    constructor(engine)
    {
        /**
         * Reference to the game engine.
         * @member {DEDA.AllGames.Core.Engine}
         */
         this.engine = engine;

        /**
         * The web-socket server used to listen to in-coming connections.
         * @member {WebSocketServer}
         */
        this.webSocketServer = new WebSocketServer({ server: engine.httpServer });

        // Listen to incoming connections
        this.webSocketServer.on('connection', webSocket=>this.onConnection(webSocket));
    }

    /**
     * Invoked by the web-socket server when a new connection is established.
     * 
     * @param {WebSocket} webSocket - The new web-socket connection.
     */
    onConnection(webSocket)
    {
        try {
            // Create a user for this connection and pass it the web socket and engine.
            const user = this.engine.createUser(webSocket);

            // Attach events to the new web-socket. This is invoked when the connection is closed. Clean up after.
            webSocket.on('close', ()=>{
                // Remove the character from the character map.
                this.engine.removeUser(user);
            });

            // Attach to the message event to receive messages form the client.
            webSocket.on('message', message=>{

                try {
                    //Parse the message form the user.
                    const event = JSON.parse(message);

                    // Pass the message to the user object to handle.
                    user.onEvent(event);

                } catch (error) {
                    console.log(error);
                }

            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = WSServer;