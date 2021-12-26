
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const image = new Image();
image.src = 'characters/guy/main.png';

setTimeout( ()=>draw(), 500);

const character = {
    motion: {
        deltaX: 5,
        deltaY: 5
    },

    position: {
        x: 100,
        y: 100
    },
    image
};



window.addEventListener( 'keydown', event=>{

    // up
    switch (event.keyCode) 
    {
    case 38: // up
        character.position.y -= character.motion.deltaY;
        break;
    case 40: // down
        character.position.y += character.motion.deltaY;
        break;
    case 37: // left
        character.position.x -= character.motion.deltaX;
        break;
    case 39: // right
        character.position.x += character.motion.deltaX;
        break;
    }

    draw();
    
} );


function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(character.image, character.position.x, character.position.y);
}