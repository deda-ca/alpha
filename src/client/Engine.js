/**
 * The game engine to renders the current state of the server.
 * 
 * @class
 * @memberof DEDA.AllGames.Client
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class Engine
{
    /**
     * Creates a new game engine.
     * @param {*} options 
     */
    constructor(options)
    {
        this.self = this;

        this.options = options;

        this.connection = new Connection(this);

        this.canvas = document.getElementById('canvas');

        this.context = canvas.getContext('2d');

        this.keyState = {};

        this.characters = [];

        this.session = {};

        this.userId = null;
        
        window.addEventListener( 'keydown', event=>{

            const keyCode = event.keyCode;

            // If the key is already down then do nothing.
            if (this.keyState[keyCode]) return;

            // Update the key state.
            this.keyState[keyCode] = true;

            // Map the keycode to the action and send it to the server.
            this.connection.send({type: 'keydown', action: this.mapKeyCode(keyCode) });
        });

        window.addEventListener( 'keyup', event=>{

            const keyCode = event.keyCode;

            // Update the key state.
            this.keyState[keyCode] = false;

            // Map the keycode to the action and send it to the server.
            this.connection.send({type: 'keyup', action: this.mapKeyCode(keyCode) });
        });

        // Start the render loop
        setInterval( ()=>window.requestAnimationFrame(()=>this.render()), this.options.renderInterval );

        // The UI of the application
        this.ui = new Vue({ el: '#characters', data: this });
    }


    onConnected()
    {
        // Request to join the server.
        this.connection.send({"type": "join"});
    }

    setCharacter(name)
    {
        this.connection.send({"type": "setCharacter", "name": name});
    }

    /**
     * 
     * @param {*} event 
     */
    async onMessage(event)
    {
        // If the actions is an array then loop though them.
        if (Array.isArray(event)) { for (let evt of event) this.onMessage(evt); return; }

        // Updates the current session user list and session maps and details.
        if (event.type === 'session')
        {
            // Populate the session with the character details.
            this.session = this.loadSession(event);

            // Find the user state within the session.
            this.session.user = this.session.users.find( user=>(user.id === this.userId) );
        }
        else if (event.type === 'user')
        {
            // Get the user ID and set it locally, this is used to fetch the user details from the sesson later.
            this.userId = event.id;
        }
        else if (event.type === 'characters')
        {
            // Traverse the characters and load their images.
            for (let character of event.characters)
                await this.loadCharacter(character);

            // Set the characters locally.
            this.characters = event.characters;
        }
        else if (event.type === 'update') this.onUpdate(event);
    }

    onUpdate(event)
    {
        // Traverse the updates and apply them if it is an array.
        if (Array.isArray(event)) { for (let evt of event) this.onUpdate(evt); return; }

        // Get the object with id.
        const object = this.session.users.find( user=>(user.id === event.id) );
        if (object)
        {
            // Traverse the properties and update them.
            for (let key in event.properties)
            {
                const value = event.properties[key]
                Utility.setProperty(object, key, value);
            }
        } 
    }


    /**
     * Loads the character details within the users.
     */
    loadSession(session)
    {
        // Traverse the users and find their corresponding character definitions.
        for (let user of session.users)
            user.characterDefinition = this.characters.find( character=>(character.name === user.state.name) );

        // Return the populated session.
        return session;
    }

    /**
     * Traverses the given character assets and converts the base64 data url to an image 
     * so we can speed up rendering.
     */
    async loadCharacter(character)
    {
        for (let name in character.states)
        {
            // Get the next state.
            let state = character.states[name];

            // Traverse the base64 and convert to images.
            for (let index = 0; index < state.assets.length; index++)
            {
                // Create the image and set the src using the data url. Replace the base64 with the image.
                state.assets[index] = await this.loadImage(state.assets[index]);
            }
            
        }
    }

    loadImage(dataURL)
    {
        return new Promise( resolve=>{
            const image = new Image()
            image.src = dataURL;
            image.onload = ()=>{
                resolve(image);
            };

        });
    }

    /**
     * Maps the given keyCode to an action based on the user preferences and options.
     */
    mapKeyCode(keyCode)
    {
console.log(keyCode);
        return this.options.keyboardMap[keyCode];
    }


    /**
     * Refreshes the render of the canvas to the current state.
     */
    render()
    {
        // Clear the canvas.
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // If there is no session then don't render anything.
        if (!this.session || !this.session.users) return;

        // Render the users in the session.
        for (let user of this.session.users)
        {
            // Get the character definition where the assets are stored.
            const character = user.characterDefinition;

            // If there is no character definition then skip it.
            if (!character) continue;

            // Get the current character state image
            const state = character.states[user.state.state];

            // If we are past the last frame then reset the motion index.
            //if (user.state.motionIndex >= (state.assets.length - 1)) user.state.motionIndex = 0;

            // Get the next frame and move to the next one.
            const image = state.assets[user.state.motionIndex++ % state.assets.length];

            // If the user direction is backwards then flip the image.
            this.context.drawImage(image, user.state.position.x, user.state.position.y, character.size.width, character.size.height);

            // Render the user name on top of the user.
            this.context.fillText(user.name, user.state.position.x, user.state.position.y);
        }
    }

}