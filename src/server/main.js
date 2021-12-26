
const path = require('path');

const Engine = require('./Engine.js');

// Setup the options;
const options = {
    port: 3000,
    publicPath: path.join(__dirname, '../client'),
    defaultCharacter: "blorbo"
};

try {
    // Create the game engine.
    const engine = new Engine(options);

} catch (error) {
    console.error(error);
}