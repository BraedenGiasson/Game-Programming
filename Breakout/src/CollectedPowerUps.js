
export default class CollectedPowerUps {

    /**
     * Instantiates a new instance of the Power Up class.
     * Represents a ball that the player can catch with their
     * paddle that will allow them to spawn another ball in the game.
     * 
     * Used to track the collected power ups.
     */
    constructor(){
        this.collectedPowerUps = [];
    }

    /**
     * Adds a collected power up to the array of collected power ups.
     * @param {*} powerUp The power up to add.
     */
    addCollectedPowerUp(powerUp){
        this.collectedPowerUps.push(powerUp);
    }

    /**
     * Gets the number of collected power ups. 
     * @returns The number of collected power ups.
     */
    getNumberOfCollectedPowerUps(){
        return this.collectedPowerUps.length;
    }

    /**
     * Gets the array of all collected power ups.
     * @returns The array of all collected power ups.
     */
    getAllCollectedPowerUps(){
        return this.collectedPowerUps;
    }

    /**
     * Removes the top collected power up from the array.
     */
    removeCollectedPowerUp(){
        this.collectedPowerUps.pop();
    }

    /**
     * Resets the collected power ups to 0.
     */
    resetCollectedPowerUps(){
        this.collectedPowerUps = [];
    }
}