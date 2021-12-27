
const fs = require('fs');
const path = require('path');

// Used to extract the character animation frames from a gif file.
const gifFrames = require('gif-frames');

/**
 * A set of global/common utility methods.
 * 
 * @class
 * @memberof DEDA.AllGames.Core
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class Utility
{
    /**
     * Reads all the stream data into a buffer and returns it.
     * 
     * @param {Stream} stream - The stream that contains the buffer to read.
     * @returns {Promise} - Returns a promise that is resolved with the stream data within a buffer.
     */
    static streamToBuffer(stream)
    {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", (err) => reject(err));
        });
    }

    /**
     * Loads the given image content and converts it into a base64 Data URL string and returns it.
     * 
     * @param {string} fullPath - The full path of the image file to load.
     * @returns {string} - The Base64 Data URL representation fo the given image file.
     */
    static getImageDataURL(fullPath)
    {
        // Get the file extension.
        const type = path.extname(fullPath);

        // Get the file content within a buffer.
        const buffer = fs.readFileSync(fullPath);

        // Convert the buffer into base 64 and return the Data URL formatting.
        return `data:image/${type.toLowerCase()};base64,` + buffer.toString('base64');
    }

    /**
     * Loads an animated gif image and extracts the frames as PNG and returns an array of base64 Data URL array.
     * 
     * @param {string} fullPath - The full path of the gif file.
     * @returns {string[]} - An array of base64 data url array of the image frames.
     */
    static async getGifFrames(fullPath)
    {
        // The image frames.
        const frames = [];

        // Extract the frames from it.
        const frameData = await gifFrames({url: fullPath, frames: 'all', outputType: 'png'});

        // Traverse the frame data and read each frame content.
        for (let frame of frameData)
        {
            // Return the frame from the stream.
            const buffer = await Utility.streamToBuffer(frame.getImage());
            
            // Convert it to base64 data url and add to the frames array.
            frames.push( `data:image/png;base64,` + buffer.toString('base64') );
        }

        // Returns the image frames.
        return frames;
    }
}

module.exports = Utility;