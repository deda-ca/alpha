

class Engine
{

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
        
        window.addEventListener( 'keydown', event=>{

            const keyCode = event.keyCode;

            // If the key is already down then do nothing.
            if (this.keyState[keyCode]) return;

            const action = {name: 'keydown', keyCode: keyCode };
            this.connection.send(action);

            this.keyState[keyCode] = true;
        });

        window.addEventListener( 'keyup', event=>{

            const keyCode = event.keyCode;

            this.keyState[keyCode] = false;
            const action = {name: 'keyup', keyCode: keyCode };
            this.connection.send(action);
        });

        setInterval( ()=>window.requestAnimationFrame(()=>this.draw()), 100 );


        this.ui = new Vue({
            el: '#characters',
            data: this,
            methods: {
                alert: function(message){ console.log(message) }
            }
        });

    }


    onConnected()
    {
        // Request to join the server.
        this.connection.send({"name": "join"});
    }

    setCharacter(name)
    {
        this.connection.send({"name": "setCharacter", "characterName": name});
    }

    /**
     * 
     * @param {*} event 
     */
    onMessage(event)
    {
        if (Array.isArray(event))
        {
            for (let evt of event) this.onMessage(evt);
            return;
        }

        if (event.type === 'session')
        {
            this.session = this.loadSession(event);

            this.session.user = this.session.users.find( user=>(user.id === this.session.info.id) );

            console.log(this.session);
        }
        else if (event.type === 'characters')
        {
            this.characters = event.characters.map( character=>character[1].info );
        }
        else if (event.type === 'update')
        {
            // Traverse the updates and apply them.
            for (let update of event.updates)
            {
                // Get the object with id.
                const object = this.session.users.find( user=>(user.id === update.id) );
                if (object) Utility.setProperty(object, update.key, update.value);
            }
        }
    }



    loadSession(session)
    {
        // Convert the character base64 assets to images.
        for (let user of session.users)
        {
            this.loadCharacter(user.character);
        }

        return session;
    }

    loadCharacter(character)
    {
        for (let name in character.assets)
        {
            let assets = character.assets[name];
            assets.frameIndex = 0;
    
            // Traverse the base64 and convert to images.
            for (let index = 0; index < assets.length; index++)
            {
                const base64 = assets[index];
                const asset = {
                    image: new Image()
                };
    
                asset.image.src = 'data:image/png;base64,' + base64;
                asset.image.onload = (error)=>{
                    //console.log(error);
                };
    
                assets[index] = asset;
            }
            
        }
    }



    draw()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Render the characters.
        if (this.session && this.session.users)
        {
            for (let user of this.session.users)
            {
                const character = user.character;

                // Get the current character state image
                const asset = character.assets[character.state];

//console.log(character.state);

                // Move to the next frame.
                asset.frameIndex++;
                if (asset.frameIndex >= asset.length) asset.frameIndex = 0;

                // Get the next frame
                const frame = asset[asset.frameIndex];
    
                // Render it.
                this.context.drawImage(frame.image, character.position.x, character.position.y, 64, 64);
            }
        }

    }

}