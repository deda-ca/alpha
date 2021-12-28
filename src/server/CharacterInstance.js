
/**
 * The User Character class represents a character within the game, This can be a user or an NPC.
 * This is used to store the current user character state, position, health, and all active properties, items, buffs, etc.
 * 
 * @todo: 
 *   - jumping should only affect Y while the current left & right will affect X.
 *   - Allow acceleration and declaration motion options.
 *   - Allow assets for acceleration and declaration as well.
 *   - Replace the idle() state function with a state stack.
 *   - Allow multiple states at the same time! maybe!
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class CharacterInstance
{
    /**
     * Creates a new active character class within a game session.
     * 
     * @param {DEDA.AllGames.Core.Engine} engine - The game engine.
     * @param {DEDA.AllGames.Core.User} [user] - If this is an NPC then pass null.
     */
    constructor(engine, user)
    {
        /**
         * Reference to the game engine.
         * @member {DEDA.AllGames.Core.Engine}
         */
        this.engine = engine;

        /**
         * The user this character belongs to or NULL if this is an NPC.
         * @member {DEDA.AllGames.Core.User}
         */
        this.user = user;

        /**
         * A reference the current character definition object that this user is using.
         * @member {DEDA.AllGames.Core.CharacterDef}
         */
        this.character = this.engine.characters.get(this.engine.options.defaultCharacter);


        /**
         * @typedef {Object} State
         * @property {string} name - The name of the character. This is also stored in the state so the client can load the assets for this character from the loaded characters.
         * @property {string} state - The current state of the character. 'idle', 'walking', etc.
         * @property {object} position - The current active position. The default value is defined within session map: {x, y}.
         * @property {object} hitBox - Defines the current active hitBox. This is dependent on the current state. The default is used until overridden by the state: {x1, y1, x2, y2}.
         * @property {integer} motionIndex -Defines the current motion index of the state. The motion defines how the object is moving in the current direction.
         * @memberof DEDA.AllGames.Core.Character.State
         */

        /**
         * Defines the current state of the character. This includes position, properties, health, etc.
         * @member {DEDA.AllGames.Core.Character.State}
         */
        this.state = {
            name: this.character.name,
            state: 'idle',
            motionIndex: 0,
            position: { x: 100, y: 100 },
            hitBox: this.character.definition.states.idle.hitBox || this.character.definition.hitBox
        };

        /**
         * A list of currently active actions to apply to the character on every tick.
         * @member {Map}
         */
        this.actions = new Map();

        /**
         * A motion ticker/timer for this character. This is active if the character is in a state that contains motion.
         * @member {Timer}
         */
        this.actionTimer = null;
    }

    /**
     * Typically invoked by the user to change the character to the new character.
     * 
     * The caller must also send the entire state to the session users as well to update the character on all clients.
     * 
     * @param {string} name - The unique name of the character to use.
     * @returns {boolean} - Returns true if set successfully, otherwise returns false.
     */
    setCharacter(name)
    {
        // If the current character has not changed then do nothing.
        if (name === this.character.name) return;

        // Get the character with the given name. If the character does not exist then do nothing.
        const character = this.engine.characters.get(name);
        if (!character) return;

        // Otherwise update the character details locally.
        this.character = character;
        this.state.name = this.character.name;
        this.state.hitBox = this.character.states[this.state.state].hitBox || this.character.hitBox;
        this.state.motionIndex = 0;

        // Inform all session users of the update.
        this.broadcast({type: 'update', id: this.user.id, properties: {'state.name': this.state.name, 'state.motionIndex': this.state.motionIndex} });
    }


    /**
     * Invoked by the user when a key is pressed or the moves moved.
     * @param {*} event 
     */
    onKeyPress(event)
    {
        let action = null;

        // Update the character based on the action then add a list of changes to the queue.
        switch(event.action)
        {
        case 'up'   : action = {name: 'up'   , type: 'walking', state: this.character.definition.states.walking, motionIndex: 0, direction: {x: 0, y:-1}}; break;
        case 'down' : action = {name: 'down' , type: 'walking', state: this.character.definition.states.walking, motionIndex: 0, direction: {x: 0, y:+1}}; break;
        case 'left' : action = {name: 'left' , type: 'walking', state: this.character.definition.states.walking, motionIndex: 0, direction: {x:-1, y: 0}}; break;
        case 'right': action = {name: 'right', type: 'walking', state: this.character.definition.states.walking, motionIndex: 0, direction: {x:+1, y: 0}}; break;
        case 'jump' : action = {name: 'jump' , type: 'jumping', state: this.character.definition.states.jumping, motionIndex: 0, direction: {x: 0, y:-1}}; break;
        default: return;
        }

        // Apply the initial action.
        this.action_apply(action);

        // Add the action onto the stack.
        this.actions.set(action.name, action);

        // If there isn't a timer then start one.
        if (!this.actionTimer) this.actionTimer = setInterval( ()=>this.action_tick(), this.engine.options.tickInterval);
    }

    /**
     * Invoked when the user release a key for the given state.
     * @param {*} event 
     */
    onKeyRelease(event)
    {
        // Get the action from the stack. If it does not exist then do nothing.
        const action = this.actions.get(event.action);
        if (!action) return;

        // Otherwise if it is a fixed action then wait until it is done.
        if (action.state.fixed) action.finished = true;
        // Otherwise remove it from the stack.
        else this.actions.delete(event.action);
    }



    action_tick()
    {
        let event = {type: 'update', id: this.user.id, properties: {}};

        // If there is no motion then do nothing.
        if (!this.actions.size)
        {
            // Clear the timer and return.
            clearInterval(this.actionTimer);
            this.actionTimer = null;

            // Set the state to idle as well.
            this.state.state = event.properties['state.state'] = 'idle';
        }
        // Otherwise traverse the actions in order and apply them.
        else for (let [key, value] of this.actions) this.action_apply(value, event)

        // Broadcast the event.
        this.broadcast(event);
    }

    action_apply(action, event)
    {
        // If reached the end of the jump then move to the idle state.
        if (action.state.type === 'single' && action.motionIndex >= action.state.motion.length)
        {
            if (action.finished)
            {
                this.actions.delete(action.name);
                return;
            }
        }

        // Update the motion index and get the motion delta for it.
        const motionDelta = action.state.motion[ action.motionIndex++ % action.state.motion.length ];
        if (!motionDelta) return;

        // Update the position.
        this.state.position.y += (action.direction.y * motionDelta.y);
        this.state.position.x += (action.direction.x * motionDelta.x);

        // Trigger a state update to the session.
        if (event)
        {
            event.properties['state.state']      = action.type;
            event.properties['state.motionIndex'] = action.motionIndex;
            event.properties['state.position.x'] = this.state.position.x;
            event.properties['state.position.y'] = this.state.position.y;
        }
    }

    /**
     * Sends the given message to all users within the user session.
     * @param {object} message - The message to broadcast.
     */
    broadcast(message)
    {
        // If the user is in a session then broadcast to that session.
        if (this.user.session) this.user.session.send(message);
    }
}

module.exports = CharacterInstance;