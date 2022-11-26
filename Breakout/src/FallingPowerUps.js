import PowerUp from "./PowerUp.js";
import { getRandomBooleanNumber, getRandomNumber } from "./utils.js";

export default class FallingPowerUps {

    /**
     * Instantiates a new instance of the Power Up class.
     * Represents a ball that the player can catch with their
     * paddle that will allow them to spawn another ball in the game.
     * 
     * Used to track the falling power ups.
     */
    constructor(){
        this.fallingPowerUps = [];
    }

    /**
     * Adds a falling power up to the array of falling power ups.
     * @param {*} powerUp The falling power up to add to the array.
     */
    addFallingPowerUp(powerUp){
        this.fallingPowerUps.push(powerUp);
    }

    /**
     * Gets the number of falling power ups on the screen.
     * @returns The number of falling power ups on the screen.
     */
    getNumberOfFallingPowerUps(){
        return this.fallingPowerUps.length;
    }

    /**
     * Gets the array of all falling power ups.
     * @returns The array of all falling power ups.
     */
    getAllFallingPowerUps(){
        return this.fallingPowerUps;
    }

    /**
     * Removes the top falling power up from the array.
     */
    removePowerUpFromArray(){
        this.fallingPowerUps.pop();
    }

    /**
     * Resets the collected power ups to 0.
     */
    resetFallingPowerUps(){
        this.fallingPowerUps = [];
    }

    /**
     * Adds a power up if randomly generated.
     * @param {*} x The x position of the power up.
     * @param {*} y The y position of the power up.
     */
    handlePowerUp(x, y){
        const maxValue = 7;

		let getRandomNumber1 = getRandomBooleanNumber(maxValue);
		let getRandomNumber2 = getRandomBooleanNumber(maxValue);

		// If random numbers are equal, spawn power up
		let hasPowerUp = getRandomNumber1 === getRandomNumber2;

        // Only add if the brick should have a power up spawn
		if(hasPowerUp){
			const newPowerUp = new PowerUp(x, y);
			this.addFallingPowerUp(newPowerUp);
		}

        return hasPowerUp;
	}
}