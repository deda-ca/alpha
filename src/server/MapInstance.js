
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
class MapInstance
{
    /**
     * 
     * 
     */
    constructor(engine, mapDefinition)
    {
        /**
         * Reference to the game engine.
         * @member {DEDA.AllGames.Core.Engine}
         */
        this.engine = engine;

        /**
         * The character detailed definition. 
         * See the character definition structure for more details.
         * 
         * @member {DEDA.AllGames.Core.Character.Definition}
         */
        this.definition = mapDefinition;
    }


    /**
     * Detects if object-1 has collided with object 2 and performs an action accordingly.
     * 
     * @param {*} object1 
     * @param {*} object2 
     */
    collisionDetection(object1, object2)
    {
        // Traverse the objects within the map and check for collisions.

    }

    rectCollisionDetection(rect1, rect2)
    {
        return (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.h + rect1.y > rect2.y);
    }
}

module.exports = MapInstance;