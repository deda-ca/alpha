
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const image = new Image();
image.src = 'characters/guy/main.png';

setTimeout( ()=>draw(), 500);

let session = {

};



window.addEventListener( 'keydown', event=>{


    const action = {name: 'keydown', keyCode: event.keyCode }

    window.webSocket.send(JSON.stringify(action));

    //draw();
    
} );

function loadCharacter(character)
{
    for (let name in character.assets)
    {
        let assets = character.assets[name];

        // Traverse the base64 and convert to images.
        for (let index = 0; index < assets.length; index++)
        {
            const base64 = assets[index];
            const asset = {
                image: new Image()
            };

            asset.image.src = 'data:image/png;base64,' + base64;
            asset.image.onload = (error)=>{
                console.log(error);
            };

            assets[index] = asset;


            //const img = new Image();
            //img.src = asset.image.src;
            //document.body.appendChild( img );
        }
        
    }
}

function loadSession(session)
{

    // Convert the character base64 assets to images.
    for (let user of session.users)
    {
        loadCharacter(user.character);
    }

    return session;
}

function updateSession(event)
{
    if (event.type === 'session')
    {
        session = loadSession(event);

    }
    else if (event.type === 'update')
    {
        // Traverse the udpates and apply them.
        for (let update of event.updates)
        {
            // Get the object with id.
            const object = session.users.find( user=>(user.id === update.id) );

            if (object) setProperty(object, update.key, update.value);
        }
    }

    draw();
}

    /**
     * Adds the given property name and value to the given object. 
     * Supports multi-object property names; for example 'user.firstName'.
     * Supports adding multiple values to the same property by converting it to an array.
     * 
     * @param {object} object - The object to add the property to.
     * @param {string} name - The name of the property.
     * @param {*} value - The value to set the property to.
     * 
     * @returns {object} Returns the given object.
     */
    function setProperty(object, name, value)
    {
        // If the name contains '.' to check if we need to split up first.
        if (name.indexOf('.') !== -1)
        {
            // Split the name and add each part of it. Remove the last name to be added as the value.
            const names = name.split('.');
            const subName = names.pop();

            // Traverse the names and add them as objects to the value.
            let subObject = object;
            for (let subName of names)
            {
                // If the property does not already exist then add it.
                if (!subObject.hasOwnProperty(subName)) subObject[subName] = {};

                // Get the sub property object.
                subObject = subObject[subName];
            }

            // At this point the subObject is where we need to the set the name and value to. Add the name and value to the sub object.
            setProperty(subObject, subName, value);
        }
        // Otherwise set the value to the property within the given object.
        else object[name] = value;

        // Return the given object.
        return object;
    }

function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render the characters.
    if (session.users)
    {
        for (user of session.users)
        {
            const character = user.character;
            const characterImage = character.assets.ideal[0].image;

            ctx.drawImage(characterImage, character.position.x, character.position.y, 64, 64);
        }
    }
    
}