/**
 * The session represents an instance of a map, lobby, donjon, etc. and all the users that are current 
 * within this session.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class Session
{
    /**
     * Creates a new session/map/game.
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
         * The list of all users that are currently within this session.
         * @member {DEDA.AllGames.Core.User[]}
         */
        this.users = new Set();

        /**
         * A list of all actions to send to the users within this session on the next tick.
         * @member {object[]}
         */
        this.tickQueue = [];

        /**
         * A timer interface that defines this session ticker/pulse.
         * @member {Timer}
         */
        this.tickTimer = setInterval( ()=>this.tick(), 100 );
    }

    /**
     * Lets the given user join this session.
     * @param {DEDA.AllGames.Core.User} user - The user.
     */
    join(user)
    {
        // If the user is already part of a different session, then remove them from there.
        if (user.session) user.session.leave(user);

        // Add the given user to the session.
        this.users.add(user);

        // Set the session within the user.
        user.setSession(this);

        // Send a message to all users to update states.
        this.send( this.serialize() );
    }

    /**
     * Removes the user from this session.
     * @param {DEDA.AllGames.Core.User} user - The user.
     */
    leave(user)
    {
        // Remove the user and clear the session.
        this.users.delete(user);
        user.setSession(null);

        // Send a message to all users to remove this user from the session.
        this.sync();
    }

    /**
     * Sends the current session state to all users ot synchronize them.
     */
    sync() {
        this.send( this.serialize() );
    }

    /**
     * Creates an object that contains the entire session state.
     * This is used for newly joined users to get them up to speed.
     * This is also used to synchronize all users with the current session state on a set interval.
     * 
     * @returns {object} - the current sessions state.
     */
    serialize()
    {
        // @todo: add the session/map details as well.
        const state = {
            type: 'session',
            users: []
        };

        // Traverse the users and serialize their state.
        for (let user of this.users) state.users.push(user.serialize());

        // Return the state.
        return state;
    }


    /**
     * Queues the given messages to be sent to the session users on the next tick.
     * @param {object} actions - the actions to send.
     */
    send(actions)
    {
        // If the actions is an array then add each item to the queue. Otherwise push the single action to the array.
        if (Array.isArray(actions)) this.tickQueue.push(  ...actions ); else this.tickQueue.push(actions);

// console.log('<- ', actions);
    }

    /**
     * Invokes by the ticker timer to execute the next tick.
     * This will update the character positions, process collisions and update users of any updates.
     */
    tick()
    {
        // If there is nothing to send then do nothing.
        if (this.tickQueue.length === 0) return;

        // If there is something in the queue then dequeue it and send it to all the users.
        const json = JSON.stringify(this.tickQueue);

        // Clear the queue.
        this.tickQueue.splice(0, this.tickQueue.length);

        // Send the data to the user session users.
        for (let user of this.users) user.send(json);
    }

}

module.exports = Session;