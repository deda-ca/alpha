
const fs = require('fs');
const path = require('path');

const Utility = require('./Utility.js');

/**
 * The Map class represents a loaded map from a JSON file. This will load all the maps sprits, images, sounds, etc and 
 * have them ready for Map Instance to reference them.
 * 
 * This class can also be extended to create custom maps that are smart; for example random generators, etc.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class MapDefinition
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
            size: {width: 1024, height: 1024},
            thumbnail: "thumbnail.png"
        };
    }

    /**
     * Loads all the map assets/images sounds, etc into the definition object.
     * This will replace the file names with the web-base64 image format of the image content.
     * 
     * This is done so we can simply send the entire character definition and all it's assets/images to the client upon request.
     * 
     * While developing and during production, we can detect changes and simply reload the files and assets without having to restart the server.
     * This will allow us to update and add new characters in realtime without having to restart the server.
     */
    async load()
    {
        // Load the background.
        this.definition.background = Utility.getImageDataURL( path.join(this.rootPath, this.definition.background) ); 

        // Load the thumbnail base64 if exists, otherwise use the first image in the idle state.
        this.definition.thumbnail = (this.definition.thumbnail ? Utility.getImageDataURL( path.join(this.rootPath, this.definition.thumbnail) ) : this.definition.states.idle.assets[0]);

        // Load the assets
        for (let name in this.definition.assets)
        {
            const asset = this.definition.assets[name];
            asset.name = name;

            this.loadAsset(asset);
        }
    }

    loadAsset(asset)
    {
        if (asset.src) asset.src = Utility.getImageDataURL( path.join(this.rootPath, asset.src) );
    }
}

module.exports = MapDefinition;