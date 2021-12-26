

class Connection
{
    constructor(engine)
    {
        this.engine = engine;

        this.socket = null;

        this.connect();

        // @todo if closed then try to reconnect with interval.
    }

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

    onMessage(evt)
    {
        try {
            const event = JSON.parse(evt.data);

            // Update the existing tree with the given data.
            this.engine.onMessage(event);

        } catch (error) {
            console.log(error);
        }
    }

    send(message)
    {
        this.socket.send(JSON.stringify(message));
    }
   
}





