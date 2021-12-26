
class UserCharacter
{
    constructor(engine, user)
    {
        this.user = user;

        this.engine = engine;

        this.character = this.engine.characters.get(this.engine.options.defaultCharacter);

        this.state = {

            name: this.character.name,

            // The starting position is fetched form the current map.
            position: { x: 100, y: 100 },

            // Defines 
            motion: { deltaY: 5, deltaX: 5 },

            // Load the default assets.
            assets: this.character.info.assets
        };
    }

    /**
     * Invoked by the user when a key is pressed.
     * @param {*} event 
     */
    onKeyPress(event)
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
            updates = {id: this.user.id, key: "character.position.y", value: this.state.position.y};
            break;
        case 40: // down
            this.state.position.y += this.state.motion.deltaY;
            updates = {id: this.user.id, key: "character.position.y", value: this.state.position.y};
            break;
        case 37: // left
            this.state.position.x -= this.state.motion.deltaX;
            updates = {id: this.user.id, key: "character.position.x", value: this.state.position.x};
            break;
        case 39: // right
            this.state.position.x += this.state.motion.deltaX;
            updates = {id: this.user.id, key: "character.position.x", value: this.state.position.x};
            break;
        }

        return updates;
    }
}

module.exports = UserCharacter;