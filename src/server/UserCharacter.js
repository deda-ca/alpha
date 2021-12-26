
class UserCharacter
{
    constructor(engine, user)
    {
        this.user = user;

        this.engine = engine;

        this.character = this.engine.characters.get(this.engine.options.defaultCharacter);

        this.state = {

            name: this.character.name,

            state: 'ideal',

            // The starting position is fetched form the current map.
            position: { x: 100, y: 100 },

            // Defines 
            motion: { deltaY: 5, deltaX: 5 },

            // Load the default assets.
            assets: this.character.info.assets
        };

        this.walkTimer = null;
    }

    /**
     * Invoked by the user when a key is pressed.
     * @param {*} event 
     */
    onKeyPress(event, isInterval = false)
    {
        // @todo: Map the event key to an action.
        const action = event.keyCode;

        // Keeps track of all changes for this object with the given ID.
        let updates = null;

        // Update the character based on the action then add a list of changes to the queue.
        switch(action)
        {
        case 38: // up
            this.state.position.y -= this.state.motion.deltaY;
            this.state.state = 'walking';
            updates = [{id: this.user.id, key: "character.position.y", value: this.state.position.y},
                        {id: this.user.id, key: "character.state", value: this.state.state}];
            
            break;
        case 40: // down
            this.state.position.y += this.state.motion.deltaY;
            this.state.state = 'walking';
            updates = [{id: this.user.id, key: "character.position.y", value: this.state.position.y},
                        {id: this.user.id, key: "character.state", value: this.state.state}];
            break;
        case 37: // left
            this.state.position.x -= this.state.motion.deltaX;
            this.state.state = 'walking';
            updates = [{id: this.user.id, key: "character.position.x", value: this.state.position.x},
                        {id: this.user.id, key: "character.state", value: this.state.state}];
            break;
        case 39: // right
            this.state.position.x += this.state.motion.deltaX;
            this.state.state = 'walking';
            updates = [{id: this.user.id, key: "character.position.x", value: this.state.position.x},
                        {id: this.user.id, key: "character.state", value: this.state.state}];
            break;
        }

        if (updates && !isInterval)
        {
            if (this.walkTimer) clearInterval(this.walkTimer);

            // Start a timer until it is released
            this.walkTimer = setInterval( ()=>{
                updates = this.onKeyPress(event, true)
                this.user.session.queue( updates );
            }, 100);
            this.walkTimer.action = action;
        }

        return updates;
    }

    onKeyRelease(event)
    {
        // @todo: Map the event key to an action.
        const action = event.keyCode;

        // Keeps track of all changes for this object with the given ID.
        let updates = null;

        // If the character was moving in that direction then stop it.
        switch(action)
        {
        case 38: // up
            this.state.state = 'ideal';
            updates = {id: this.user.id, key: "character.state", value: this.state.state};
            break;
        case 40: // down
            this.state.state = 'ideal';
            updates = {id: this.user.id, key: "character.state", value: this.state.state};
            break;
        case 37: // left
            this.state.state = 'ideal';
            updates = {id: this.user.id, key: "character.state", value: this.state.state};
            break;
        case 39: // right
            this.state.state = 'ideal';
            updates = {id: this.user.id, key: "character.state", value: this.state.state};
            break;
        }

        if (updates && this.walkTimer && (this.walkTimer.action === action)) 
        {
            clearInterval(this.walkTimer);
            this.walkTimer = null;
        }

        return updates;
    }
}

module.exports = UserCharacter;