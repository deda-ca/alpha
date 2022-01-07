
const fs = require('fs');
const path = require('path');


const http = require('http');
const express = require('express');

const User = require('./User.js');
const Session = require('./Session.js');
const WSServer = require('./WebSocketServer.js');
const MapDefinition = require('./MapDefinition.js');
const CharacterDefinition = require('./CharacterDefinition.js');

/**
 * The game engine contains all the internal classes and provides an interface them internal communications.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
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
         * 
         */
        this.maps = this.loadMaps();

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
        this.lobbySession = this.createSession('lobby', 'map-1');
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
            const character = new CharacterDefinition( path.join(__dirname, "/assets/characters/", name), name );

            // Add the character to the map.
            characters.set(name, character);
        }

        return characters;
    }

    /**
     * Loads all the maps from the file system into memory to used when requested.
     */
    loadMaps()
    {
        // A list of all loaded characters and their assets.
        const maps = new Map();

        // Load the characters JSON file the lists all the valid characters to use.
        const jsonMaps = fs.readFileSync(path.join(__dirname, "/assets/maps/maps.json"), "UTF8");
        const mapNames = JSON.parse(jsonMaps);

        // Loop though the characters and load them.
        for (let name of mapNames)
        {
            // Create a new character class the will automatically load itself.
            const map = new MapDefinition( path.join(__dirname, "/assets/maps/", name), name );

            // Add the character to the map.
            maps.set(name, map);
        }

        return maps;
    }


    /**
     * Creates a user object for the connected user and joins them to the lobby session.
     * 
     * @param {Socket} socket - The socket for this user.
     * @returns {DEDA.AllGames.Core.User} - Returns the created user.
     */
    createUser(socket)
    {
        // Create a new user object passing it all the required information.
        const user = new User(this, socket);

        // Add the user to the list of connected users.
        this.users.set(user.id, user);

        // Add the user to the main session;
        this.lobbySession.join(user);

        // Return the created user.
        return user;
    }

    /**
     * Invoked by the socket when it is closed.
     * 
     * @param {DEDA.AllGames.Core.User} user - The user to remove.
     */
    removeUser(user)
    {
        // @todo: Disconnects the socket if it is not already closed.

        // Remove the user from any sessions first.
        if (user.session) user.session.leave(user);

        // Removes the user form the list.
        this.users.delete(user.id);
    }


    /**
     * Creates a new session and adds it to the list of engine session.
     * 
     * @param {string} name - The name of the session to add.
     * @returns {DEDA.AllGames.Core.Session} - Returns the newly created session.
     */
    createSession(name, mapName)
    {
        // Find the map with the given name.
        const mapDefinition = this.maps.get(mapName);

        // @todo: If not found then log error.

        const session = new Session(this, mapDefinition);
        this.sessions.set(session.id, session);
        return session;
    }
}



module.exports = Engine;