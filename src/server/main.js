
const path = require('path');

const Engine = require('./Engine.js');

// Setup the options;
const options = {
    port: 3000,
    publicPath: path.join(__dirname, '../client'),
    defaultCharacter: "blorbo",

    tickInterval: 100,

    characterNames: [
        "Shepard",
        "Ezio",
        "Earthworm Jim",
        "Pit of Kid Icarus",
        "Fargoth",
        "McCree",
        "Jonathan Irons",
        "Handsome Jack",
        "Rayman",
        "Diddy Kong",
        "Urdnot Wrex",
        "Ryu Hayabusa",
        "Spyro",
        "Nathan Drake",
        "Deckard Cain",
        "Gordon Freeman",
        "GLaDOS",
        "Samus Aran",
        "Princess Zelda",
        "Agent 47",
        "Sam Fisher",
        "Jack of Blades",
        "Sonic the Hedgehog",
        "Donkey Kong",
        "Banjo",
        "Pikachu",
        "Bonnie MacFarlane",
        "Rayne",
        "Cortana",
        "Sarah Kerrigan",
        "Bowser",
        "Marcus Fenix",
        "Megaman",
        "Max Payne",
        "Subzero",
        "Kratos",
        "Kitana",
        "Scorpion",
        "Ganondorf",
        "Pacman",
        "Duke Nukem",
        "Cloud Strife",
        "Geralt of Rivia",
        "Lara Croft",
        "Princess Peach Toadstool",
        "Solid Snake",
        "Mario",
        "Link",
        "John Marston",
        "Master Chief"
    ]
};

try {
    // Create the game engine.
    const engine = new Engine(options);

} catch (error) {
    console.error(error);
}