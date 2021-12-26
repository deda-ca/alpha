
// Import local objects.
const UserCharacter = require('./UserCharacter.js');


class User
{
    constructor(engine, socket)
    {
        // Generate a new unique ID for it.
        this.id = engine.generateId('user');

        this.engine = engine;

        this.socket = socket;

        // Create the user character
        this.character = new UserCharacter(engine, this);

        this.session = null;

        this.info = {
            name: 'Unnamed'
        };
    }

    join(session)
    {
        this.session = session;
    }

    leave()
    {
        this.session = null;
    }

    disconnect()
    {
        if (this.session) this.session.leave(this);
    }

    /**
     * Invoked by the server when the user generates an event such as a keypress.
     * 
     * @param {*} event 
     */
    onEvent(event)
    {
        console.log(event);

        // Based on the event given from the client perform an action.
        switch (event.name)
        {
        // If key press then pass the event to the character of this connection.
        case 'keydown': this.onKeyPress(event); break;
        case 'join': this.session.queue(); break;
        }
    }

    /**
     * 
     * @param {*} event 
     */
    onKeyPress(event)
    {
        // If the user is within a session then pass the event to the character.
        const updates = this.character.onKeyPress(event);

        // if there are changes then queue them.
        if (updates) this.session.queue( updates );
    }


    serialize()
    {
        return {
            id: this.id,
            info: this.info,
            character: this.character.state
        };
    }


    send(data)
    {
        this.socket.send(data);
    }
}



module.exports = User;