
/**
 * The User Character class represents a character within the game, This can be a user or an NPC.
 * This is used to store the current user character state, position, health, and all active properties, items, buffs, etc.
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
         * @property {object} direction - Defines the direction vector the user is moving in: {x: +1, y: +1}.
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
            position: { x: 100, y: 100 },
            direction: {x: 0, y: -1},
            keyPresses: { up: false, down: false, right: false, left: false, jump: false, crouch: false },
            hitBox: this.character.definition.states.idle.hitBox || this.character.definition.hitBox,
            motionIndex: 0
        };

        /**
         * A motion ticker/timer for this character. This is active if the character is in a state that contains motion.
         * @member {Timer}
         */
        this.motionTimer = null;
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
        // Update the character based on the action then add a list of changes to the queue.
        switch(event.action)
        {
        case 'up'   : this.state.keyPresses.up    = true; this.walk(0, -1); break;
        case 'down' : this.state.keyPresses.down  = true; this.walk(0, +1); break;
        case 'left' : this.state.keyPresses.left  = true; this.walk(-1, 0); break;
        case 'right': this.state.keyPresses.right = true; this.walk(+1, 0); break;
        case 'jump' : this.state.keyPresses.jump  = true; this.jump(); break;
        }
    }

    /**
     * Invoked when the user release a key for the given state.
     * @param {*} event 
     */
    onKeyRelease(event)
    {
        // If the character was moving in that direction then stop it.
        switch(event.action)
        {
        // Do nothing for this one.
        case 'jump':
            this.state.keyPresses.jump = false;
            break;

        // if moving in any direction and released button then go to idle.
        case 'up':    this.state.keyPresses.up = false; this.idle(); break;
        case 'down':  this.state.keyPresses.down = false; this.idle(); break;
        case 'left':  this.state.keyPresses.left = false; this.idle(); break;
        case 'right': this.state.keyPresses.right = false; this.idle(); break;
        }
    }

    /**
     * Sets the state of the character to idle.
     */
    idle()
    {
        // If currently jumping then complete the jump first.
        if (this.state.state === 'jumping') return;

        // If there is a motion timer then clear it.
        if (this.motionTimer) clearInterval(this.motionTimer);

        // Check which key is pressed and act accordingly before going to idle.
        if (this.state.direction.x === -1 && this.state.keyPresses.left) return this.walk(-1), 0; 
        else if (this.state.direction.x === +1 && this.state.keyPresses.right) return this.walk(+1, 0);
        else if (this.state.direction.y === -1 && this.state.keyPresses.up) return this.walk(0, -1);
        else if (this.state.direction.y === +1 && this.state.keyPresses.down) return this.walk(0, +1);
        else if (this.state.keyPresses.left) return this.walk(-1, 0); 
        else if (this.state.keyPresses.right) return this.walk(+1, 0);
        else if (this.state.keyPresses.up) return this.walk(0, -1);
        else if (this.state.keyPresses.down) return this.walk(0, +1);

        // Set the state to idle and clear any motions and reset the motion index.
        this.state.state = 'idle';
        this.state.motion = null;
        this.state.motionIndex = 0;
        this.state.direction.x = 0;
        
        // Add a state update to the session.
        this.broadcast({type: 'update', id: this.user.id, properties: {'state.state': this.state.state, 'state.motionIndex': this.state.motionIndex, 'state.direction.x': this.state.direction.x} });
    }

    /**
     * Invoked when the user clicks on the walk keys to walk either left or right based on the direction.
     * @param {integer} xDirection - +1 for left and -1 for right, 0 to not move in this direction.
     * @param {integer} yDirection - +1 for up and -1 for down, 0 to not move in this direction.
     */
    walk(xDirection = 0, yDirection = 0)
    {
        // If currently jumping then complete the jump first.
        if (this.state.state === 'jumping') return;

        // If there is a motion timer then clear it.
        if (this.motionTimer) clearInterval(this.motionTimer);

        // Set the state to idle and clear any motions and reset the motion index. Update the X and Y directions as well.
        this.state.state = 'walking';
        this.state.motion = this.character.definition.states.walking.motion;
        this.state.motionIndex = 0;
        this.state.direction.x = xDirection;
        this.state.direction.y = yDirection;

        // Add a state update to the session.
        this.broadcast({type: 'update', id: this.user.id, properties: {'state.state': this.state.state, 'state.motionIndex': this.state.motionIndex, 'state.direction.x': xDirection, 'state.direction.y': yDirection} });

        // Invoke the first walk to get started immediately
        this.walk_tick();

        // Set the jump_next within the pulse/ticker.
        this.motionTimer = setInterval( ()=>this.walk_tick(), this.engine.options.tickInterval);
    }

    /**
     * Invoked by the ticker to move the jumping state to the next position.
     */
    walk_tick()
    {
        // If there is no motion then do nothing.
        if (!this.state.motion) return;

        // Update the motion index and get the motion delta for it.
        const motionDelta = this.state.motion[ this.state.motionIndex++ % this.state.motion.length ];
        if (!motionDelta) return;

        // Update the position.
        this.state.position.y += (this.state.direction.y * motionDelta.y);
        this.state.position.x += (this.state.direction.x * motionDelta.x);

        // Trigger a state update to the session.
        this.broadcast({type: 'update', id: this.user.id, properties: {'state.motionIndex': this.state.motionIndex, 'state.position.x': this.state.position.x, 'state.position.y': this.state.position.y} });
    }

    /**
     * Invoked when the user clicks on the jump button.
     */
    jump()
    {
        // If the character is already jumping then do nothing unless they have a double/triple jump ability.
        // @todo: add multi-jumps in future releases.
        if (this.state.state === 'jumping') return;

        // If there is a motion timer then clear it.
        if (this.motionTimer) clearInterval(this.motionTimer);

        // Update the state and set the jumping motion.
        this.state.state = 'jumping';
        this.state.motion = this.character.definition.states['jumping'].motion;
        this.state.motionIndex = 0;

        // Add a state update to the session.
        this.broadcast({type: 'update', id: this.user.id, properties: {'state.state': this.state.state, 'state.motionIndex': this.state.motionIndex} });

        // Invoke the jump process.
        this.jump_tick();

        // Set the jump_next within the pulse/ticker.
        this.motionTimer = setInterval( ()=>this.jump_tick(), this.engine.options.tickInterval);
    }

    /**
     * Invoked by the ticker to move the jumping state to the next position.
     */
    jump_tick()
    {
        // If reached the end of the jump then move to the idle state.
        if (this.state.motionIndex >= this.state.motion.length)
        {
            // Clear the jump state first.
            this.state.state = 'idle';
            return this.idle();
        }

        // Update the motion index and get the motion delta for it.
        const motionDelta = this.state.motion[ this.state.motionIndex++ % this.state.motion.length ];
        if (!motionDelta) return;

        // Update the position.
        this.state.position.y += (-1 * motionDelta.y);
        this.state.position.x += (this.state.direction.x * motionDelta.x);

        // Trigger a state update to the session.
        this.broadcast({type: 'update', id: this.user.id, properties: {'state.motionIndex': this.state.motionIndex, 'state.position.x': this.state.position.x, 'state.position.y': this.state.position.y} });
    }

    /**
     * Sends the given message to all users within the user session.
     * @param {object} message - The message to broadcast.
     */
    broadcast(message)
    {
        if (this.user.session) this.user.session.send(message);
    }
}

module.exports = CharacterInstance;