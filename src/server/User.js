
// Import local objects.
const CharacterInstance = require('./CharacterInstance.js');

/**
 * The user class represents a currently connected in user.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class User
{
    /**
     * Creates a new user when a new connection is established with the server.
     * 
     * @param {DEDA.AllGames.Core.Engine} engine - Reference to the game engine.
     * @param {Socket} socket - A reference to the connection socket used to communicate with the user client.
     */
    constructor(engine, socket)
    {
        /**
         * Reference to the game engine.
         * @member {DEDA.AllGames.Core.Engine}
         */
        this.engine = engine;

        /**
         * Generate a new unique ID for this user.
         * @member {integer}
         */ 
        this.id = engine.generateId('user');

        /**
         * Initially generates a random name, but can be updated by the user later.
         * @member {string}
         */
        this.name = this.id + "-" + this.engine.options.characterNames[ Math.floor(Math.random() * this.engine.options.characterNames.length) ]

        /**
         * A reference to the connection socket used to communicate with the user client.
         * @member {Socket}
         */
        this.socket = socket;

        /**
         * A reference to the current session/instance/map that the user has joined.
         * The user must always been in a session. The lobby is also a session.
         * @member {DEDA.AllGames.Core.Session}
         */
        this.session = null;

        /**
         * A new character instance that represents this user within the game session.
         * @member {DEDA.AllGames.Core.CharacterInstance}
         */
        this.characterInstance = new CharacterInstance(engine, this);
    }

    /**
     * Joins the given session. If already part of a session then leaves it first.
     * This is invoked by the session to the set the local variable.
     * 
     * @param {DEDA.AllGames.Core.Session} session - The session to join.
     */
    setSession(session) { this.session = session; }

    /**
     * Invoked by the server when the user generates an event such as a keypress, or mouse events.
     * 
     * @param {*} event 
     */
    onEvent(event)
    {
//console.log("-> ", event);

        // Based on the event given from the client perform an action.
        switch (event.type)
        {
        case 'join': 

            // Send all the character definitions to the client first.
            const response = { type: 'characters', characters: Array.from( this.engine.characters.values()).map( character=>character.definition ) };
            this.send( JSON.stringify(response) );

            // Then send the current session state.
            let state = {type: 'user', id: this.id};
            this.send( JSON.stringify(state));

            break;
        // If key press then pass the event to the character of this connection.
        case 'keyup'       : this.characterInstance.onKeyRelease(event); break;
        case 'keydown'     : this.characterInstance.onKeyPress(event); break;
        case 'setCharacter': this.characterInstance.setCharacter(event.name); break;
        }
    }

    /**
     * This is used to serialize the user state and return it to the client for rendering.
     * Typically this is called the first time a user joins, later only the updated states are sent.
     * 
     * @returns {object} - an object that represents the current state of the user.
     */
    serialize()
    {
        return {
            id: this.id,
            name: this.name,
            state: this.characterInstance.state
        };
    }

    /**
     * Sends the given data to the user client via the socket.
     * 
     * @param {string | buffer} data - The data to send to this user.
     */
    send(data) { this.socket.send(data); }
}



module.exports = User;