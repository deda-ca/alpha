
const fs = require('fs');
const path = require('path');

const Utility = require('./Utility.js');

/**
 * The Character class is a loaded representation of a character asset as defined within the character JSON file.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class Character
{
    /**
     * The character definition loader constructor.
     * 
     * @param {string} name - The unique name of the character which is also the directory name of the character.
     * @param {string} rootPath - the root path where the character assets and definition is stored.     
     */
    constructor(rootPath, name)
    {
        /**
         * The name of the character. The display name of the character is stored within the definition under name.
         * @member {string}
         */
        this.name = name;

        /**
         * The root path where all the character assets are stored. This is the relative path for all 
         * asset paths within the character definition JSON.
         * @member {string}
         */
        this.rootPath = rootPath;        

        /**
         * The character detailed definition. 
         * See the character definition structure for more details.
         * 
         * @member {DEDA.AllGames.Core.Character.Definition}
         */
        this.definition = JSON.parse( fs.readFileSync( path.join(rootPath, 'definition.json') , 'utf8')  );
        this.definition.name = name;

        // Load the character assets within the definition.
        this.load();
    }

    /**
     * Defines the default structure of a character used for reference purposes. The properties are self explanatory.
     * @returns {DEDA.AllGames.Core.Character.Definition}
     */
    static getDefaultDefinition()
    {
        return {
            displayName: "Unnamed",
            size: {width: 64, height: 64},
            baseline: 0,
            hitBox: {x1: 0, y1: 0, x2: 64, y2: 64},
            thumbnail: "thumbnail.png",
            states: {
                idle: {
                    assets: "idle.gif"
                },
                walking: {
                    motion: [{x: 5, y: 0}],
                    assets: "walking.gif"
                },
                jumping: {
                    motion: [{x: 3, y: 10}, {x: 3, y: 10}, {x: 3, y: 5}, {x: 3, y: 0}, {x: 3, y: -5}, {x: 3, y: -10}, {x: 3, y: -10}],
                    assets: "jumping.gif"
                },
                running: {
                    motion: [{x: 10, y: 0}],
                    assets: "running.gif"
                },
                crouching: {
                    hitBox: {x1: 0, y1: 0, x2: 32, y2: 64}
                },
                crouching_walking: {
                    motion: [{x: 5, y: 0}],
                    hitBox: {x1: 0, y1: 0, x2: 32, y2: 64},
                    assets: "crouching_walking.gif"
                }
            }
        };
    }

    /**
     * Loads all the character assets/images into the definition object.
     * This will replace the file names with the web-base64 image format of the image content.
     * 
     * This is done so we can simply send the entire character definition and all it's assets/images to the client upon request.
     * 
     * While developing and during production, we can detect changes and simply reload the files and assets without having to restart the server.
     * This will allow us to update and add new characters in realtime without having to restart the server.
     */
    async load()
    {
        // Traverse the assets and load them within the JSON.
        for (let stateName in this.definition.states)
        {
            // Get the state and replace the assets file names with the actual base64 images.
            const state = this.definition.states[stateName];
            state.assets = await this.loadAssets(state.assets);

            //console.log(state);
        }

        // Load the thumbnail base64 if exists, otherwise use the first image in the idle state.
        this.definition.thumbnail = (this.definition.thumbnail ? Utility.getImageDataURL(this.definition.thumbnail) : this.definition.states.idle.assets[0]);
    }

    /**
     * Loads the image files listed within the given array into base64 Data URL and returns them. If the image is a gif then the
     * image frames are extracted, loaded and returned.
     * 
     * The `rootPath` is used to resolve the file name path.
     * 
     * @param {string | string[]} assets - a list of file names or a single gif file name of the assets array to load.
     * @returns {string[]} - a list of base64 data url images.
     */
    async loadAssets(assets)
    {
        // If the asset is an array then load each image separately.
        if (Array.isArray(assets))
        {
            // Traverse the assets and load them within the JSON. Replace the image file name with the Base64 Data URL of the image.
            for (let index = 0; index < assets.length; index++) assets[index] = Utility.getImageDataURL( path.join(this.rootPath, assets[index]) ); 
        }
        // Otherwise if it is an animated gif then extract the frames.
        else assets = await Utility.getGifFrames( path.join(this.rootPath, assets) );

        // Return the created assets array.
        return assets;
    }
}

module.exports = Character;