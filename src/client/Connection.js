
/**
 * A web-socket client that opens a connection to the server and keeps it open.
 * If the connection is closed then it will attempt to reconnect.
 * 
 * @class
 * @memberof DEDA.AllGames.Client
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class Connection
{
    /**
     * Creates a new web-socket client.
     * 
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
         * The web-socket class.
         * @member {WebSocket}
         */
        this.socket = null;

        // Connect to the server.
        this.connect();

        // @todo if closed then try to reconnect with interval.
    }

    /**
     * Connects to the server. If already connected then closes the connection and tries again.
     */
    connect()
    {
        if (this.socket)
        {
            this.socket.close();
            this.socket = null;
        }

        this.socket = new WebSocket(this.engine.options.host, this.engine.options.protocols);
        this.socket.onopen = ()=>this.engine.onConnected();
        this.socket.onmessage = (evt)=>this.onMessage(evt);
        this.socket.onclose = ()=>this.connect();
    }

    /**
     * Invoked when a new messages is received from the server.
     * This will pass the message to the game engine for processing.
     * @param {Event} event - The event.
     */
    onMessage(event)
    {
        try {
            // parses the actions
            const actions = JSON.parse(event.data);

            // Update the existing tree with the given data.
            this.engine.onMessage(actions);

        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Serializes and sends the given message to the server.
     * @param {object} message - The message to send.
     */
    send(message)
    {
        this.socket.send(JSON.stringify(message));
    }   
}





