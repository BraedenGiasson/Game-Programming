
export default class KeyCollectedPowerUps {

    /**
     * Instantiates a new instance of the Power Up class.
     * Represents a ball that the player can catch with their
     * paddle that will allow them to spawn another ball in the game.
     * 
     * Used to track the key falling power ups.
     */
    constructor(){
        this.keyCollectedPowerUps = [];
    }

    /**
     * Adds a collected power up to the array of collected power ups.
     * @param {*} powerUp The power up to add.
     */
    addKeyCollectedPowerUp(powerUp){
        this.keyCollectedPowerUps.push(powerUp);
    }

    /**
     * Gets the number of collected power ups. 
     * @returns The number of collected power ups.
     */
    getNumberOfKeyCollectedPowerUps(){
        return this.keyCollectedPowerUps.length;
    }

    /**
     * Gets the array of all collected power ups.
     * @returns The array of all collected power ups.
     */
    getAllKeyCollectedPowerUps(){
        return this.keyCollectedPowerUps;
    }

    /**
     * Removes the top key collected power up from the array.
     */
    removeKeyCollectedPowerUp(){
        this.keyCollectedPowerUps.pop();
    }

    /**
     * Resets the collected power ups to 0.
     */
    resetKeyCollectedPowerUps(){
        this.keyCollectedPowerUps = [];
    }
}