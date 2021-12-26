
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

        let updates = null;

        // Based on the event given from the client perform an action.
        switch (event.name)
        {
        // If key press then pass the event to the character of this connection.
        case 'keydown': updates = this.character.onKeyPress(event); break;
        case 'keyup': updates = this.character.onKeyRelease(event); break;
        case 'join': this.session.queue(); break;
        }

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