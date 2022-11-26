import KeyPowerUp from "./KeyPowerUp.js";
import { getRandomBooleanNumber, getRandomNumber } from "./utils.js";

export default class KeyFallingPowerUps {

    /**
     * Instantiates a new instance of the Power Up class.
     * Represents a ball that the player can catch with their
     * paddle that will allow them to spawn another ball in the game.
     * 
     * Used to track the key falling power ups.
     */
    constructor(){
        this.keyFallingPowerUps = [];
    }

    /**
     * Adds a falling power up to the array of falling power ups.
     * @param {*} powerUp The falling power up to add to the array.
     */
    addKeyFallingPowerUp(powerUp){
        this.keyFallingPowerUps.push(powerUp);
    }

    /**
     * Gets the number of falling power ups on the screen.
     * @returns The number of falling power ups on the screen.
     */
    getNumberOfKeyFallingPowerUps(){
        return this.keyFallingPowerUps.length;
    }

    /**
     * Gets the array of all falling power ups.
     * @returns The array of all falling power ups.
     */
    getAllKeyFallingPowerUps(){
        return this.keyFallingPowerUps;
    }

    /**
     * Removes the top key falling power up from the array.
     */
    removeKeyPowerUpFromArray(){
        this.keyFallingPowerUps.pop();
    }

    /**
     * Resets the collected power ups to 0.
     */
    resetKeyFallingPowerUps(){
        this.keyFallingPowerUps = [];
    }

    /**
     * Adds a power up if randomly generated.
     * @param {*} x The x position of the power up.
     * @param {*} y The y position of the power up.
     */
    handleKeyPowerUp(x, y){
        const maxValue = 8;

		let getRandomNumber1 = getRandomBooleanNumber(maxValue);
		let getRandomNumber2 = getRandomBooleanNumber(maxValue);

		// If random numbers are equal, spawn key power up
		let hasKeyPowerUp = getRandomNumber1 === getRandomNumber2;

        // Only add if the brick should have a power up spawn
		if(hasKeyPowerUp){
			const newKeyPowerUp = new KeyPowerUp(x, y);
			this.addKeyFallingPowerUp(newKeyPowerUp);
		}
	}
}