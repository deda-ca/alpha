
const fs = require('fs');
const path = require('path');


const http = require('http');
const express = require('express');

const User = require('./User.js');
const Session = require('./Session.js');
const WSServer = require('./WebSocketServer.js');
const Character = require('./Character.js');

class Engine
{
    /**
     * 
     * @param {*} options 
     */
    constructor(options)
    {
        /**
         * 
         */
        this.options = options;

        /**
         * 
         */
        this.app = express();

        /**
         * 
         */
        this.httpServer = http.createServer(this.app);

        /**
         * 
         */
        this.webSocketServer = new WSServer(this);

        /**
         * This is a list of all the currently connected users.
         * @member {Map}
         */
        this.users = new Map();

        /**
         * 
         * @member {Map[Session]};
         */
        this.sessions = new Map();

        /**
         * 
         */
        this.characters = this.loadCharacters();

        /**
         * ID generator.
         * @member {integer}
         */
        this.nextId = 100;

        // Add the express static file server.
        this.app.use(express.static(this.options.publicPath));

        // Finally start the server by listing to the port.
        this.httpServer.listen(this.options.port, ()=>console.log(`listening at http://localhost:${this.options.port}`) );

        // Start the global session.
        this.mainSession = this.createSession();
    }

    /**
     * Generates a new game ID for the given item type.
     * 
     * @param {string} type -
     * @returns {integer} - 
     */
    generateId(type)
    {
        return this.nextId++;
    }

    /**
     * Loads all the characters from the file system into memory to be used when requested.
     */
    loadCharacters()
    {
        // A list of all loaded characters and their assets.
        const characters = new Map();

        // Load the characters JSON file the lists all the valid characters to use.
        const jsonCharacters = fs.readFileSync(path.join(__dirname, "/assets/characters/characters.json"), "UTF8");
        const characterNames = JSON.parse(jsonCharacters);

        // Loop though the characters and load them.
        for (let name of characterNames)
        {
            // Create a new character class the will automatically load itself.
            const character = new Character( path.join(__dirname, "/assets/characters/", name), name );

            // Add the character to the map.
            characters.set(name, character);
        }

        return characters;
    }


    /**
     * Creates a user connected user 
     * 
     * @param {*} webSocket 
     * @returns 
     */
    createUser(socket)
    {
        // Create a new user object passing it all the required information.
        const user = new User(this, socket);

        // Add the user to the list of connected users.
        this.users.set(user.id, user);

        // Add the user to the main session;
        this.mainSession.join(user);

        // Return the created user.
        return user;
    }

    removeUser(user)
    {
        // @todo: Disconnects the socket if it is not already closed.

        // Remove the user from any sessions first.
        user.disconnect();

        // Removes the user form the list.
        this.users.delete(user.id);

        
    }

    createSession()
    {
        const session = new Session(this);

        this.sessions.set(session.id, session);

        return session;
    }
}



module.exports = Engine;