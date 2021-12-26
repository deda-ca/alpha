
const fs = require('fs');
const path = require('path');

const gifFrames = require('gif-frames');
const { all } = require('express/lib/application');

class Character
{
    constructor(rootPath, name)
    {
        this.rootPath = rootPath;

        this.name = name;

        // Load the character details
        this.info = JSON.parse( fs.readFileSync( path.join(rootPath, 'info.json') , 'utf8')  );

        this.info.name = name;

        this.load();

    }

    async load()
    {
        // Traverse the assets and load them within the JSON.
        this.info.assets.ideal = await this.loadAssets(this.info.assets.ideal);

        this.info.assets.walking = await this.loadAssets(this.info.assets.walking);
    }


    async loadAssets(assets)
    {
        // If the asset is an array then load each email
        if (Array.isArray(assets))
        {
            // Traverse the assets and load them within the JSON.
            for (let index = 0; index < assets.length; index++)
            {
                const fileName = assets[index];

                const filePath = path.join(this.rootPath, fileName); 
                const fileContent = fs.readFileSync( filePath );
                const base64 = Buffer.from(fileContent).toString('base64');

                assets[index] = base64; /*
                {
                    name: fileName,
                    path: filePath,
                    binary: fileContent,
                    base64: base64
                }; */
            }
        }
        // Otherwise if it is an animated gif then extract the frames
        else
        {
            const filePath = path.join(this.rootPath, assets);

            // Convert the assets to an array of images.
            assets = [];

            // Extract the frames from it.
            const frameData = await gifFrames({url: filePath, frames: 'all', outputType: 'png'});

            for (let frame of frameData)
            {
                const buffer = await this.streamToBuffer(frame.getImage());
                
                assets.push( buffer.toString('base64') );

            }
        }

        return assets;
    }

    streamToBuffer(stream) {

        return new Promise((resolve, reject) => {
            
            const chunks = [];
    
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", (err) => reject(err));
    
        });
    } 
}

module.exports = Character;