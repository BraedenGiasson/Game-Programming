import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	images
} from "./globals.js";
import SpriteManager from "./SpriteManager.js";

export default class UserInterface {
	/**
	 * A helper class to draw the UI so that it can be used in many states.
	 *
	 * @param {Number} health
	 * @param {Number} score
	 * @param {Number} level
	 * @param {Number} collectedPowerUps
	 *  @param {Number} keyCollectedPowerUps
	 */
	constructor(health, score, collectedPowerUps, keyCollectedPowerUps, level) {
		this.health = health;
		this.score = score;
		this.level = level;
		this.collectedPowerUps = collectedPowerUps;
		this.keyCollectedPowerUps = keyCollectedPowerUps;
	}

	update(health, score, collectedPowerUps, keyCollectedPowerUps, level = this.level) {
		this.health = health;
		this.score = score;
		this.level = level;
		this.collectedPowerUps = collectedPowerUps;
		this.keyCollectedPowerUps = keyCollectedPowerUps;
	}

	render() {
		images.background.render(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Renders the current level at the top left.
		context.save();
		context.font = "10px Joystix";
		context.fillStyle = "white";
		context.fillText(`Level: ${this.level}`, 10, 20);
		context.restore();

		const maxOnScreenRenderCollectedPowerUps = 7;
		const maxOnScreenRenderKeyCollectedPowerUps = 3;

		/*
		*	Renders the power ups at the middle of the screen.
		*/
		let powerUpsX = CANVAS_WIDTH - 154;
		const powerUpsSprite = SpriteManager.generatePowerUpSprite();

		// Render collected power ups
		this.renderCollectedPowerUps(
			maxOnScreenRenderCollectedPowerUps,
			powerUpsX, 
			powerUpsSprite, 
			this.collectedPowerUps.getAllCollectedPowerUps()
		)

		/**
		 *  Renders the key power ups at the 1/4 of the screen.
		*/
		let keyPowerUpsX = CANVAS_WIDTH - 300;
		const keyPowerUpsSprite = SpriteManager.generateKeyPowerUpSprite();

		// Render key collected power ups
		this.renderCollectedPowerUps(
			maxOnScreenRenderKeyCollectedPowerUps,
			keyPowerUpsX, 
			keyPowerUpsSprite, 
			this.keyCollectedPowerUps.getAllKeyCollectedPowerUps()
		)

		/*
			Renders hearts based on how much health the player has. First renders
			full hearts, then empty hearts for however much health we're missing.
		*/
		let healthX = CANVAS_WIDTH - 130;
		const sprites = SpriteManager.generateHeartSprites();

		// Render health left.
		for (let i = 0; i < this.health; i++) {
			sprites[0].render(healthX, 12);
			healthX = healthX + 11;
		}

		// Render missing health.
		for (let i = 0; i < 3 - this.health; i++) {
			sprites[1].render(healthX, 12);
			healthX = healthX + 11;
		}

		/*
			Renders the player's score at the top right, with left-side padding
			for the score number.
		*/
		context.save();
		context.font = "10px Joystix";
		context.fillStyle = "white";
		context.fillText(`Score:`, CANVAS_WIDTH - 85, 20);
		context.textAlign = 'right';
		context.fillText(`${this.score}`, CANVAS_WIDTH - 10, 20);
		context.restore();
	}

	/**
	 * Renders the power ups on the screen.
	 * @param {*} maxOnScreenRender The max sprites to be rendered next to each other on screen.
	 * @param {*} thePowerUpsX The start x location to render the first sprite.
	 * @param {*} thePowerUpsSprite The power up sprite.
	 * @param {*} thePowerUpsArray The power up array.
	 */
	renderCollectedPowerUps(maxOnScreenRender, thePowerUpsX, thePowerUpsSprite, thePowerUpsArray){
		// Loop over the specified array
		for (let i = 0; i < thePowerUpsArray.length; i++) {
			// Render the +... if the current index has reached the max for screen rendering 
			if (i >= maxOnScreenRender){
				// The remaining collected power ups in the array
				let remainingCollectedPowerUps = thePowerUpsArray.length - i;

				// Only render the +... if there's at least 1 more in the array
				if (remainingCollectedPowerUps === 0) break;

				// Move x location to look good on screen
				thePowerUpsX += 5;

				/**
				 * Renders a plus sign with the number of power ups collected
				 * that can't fit on the screen.
				 */
				context.save();
				context.font = "10px Joystix";
				context.fillStyle = "white";
				context.fillText(`+`, thePowerUpsX, 12.5);
				context.textAlign = 'center';
				context.fillText(`${remainingCollectedPowerUps}`, thePowerUpsX + 2, 22.5);
				context.textAlign = "center";
				context.restore();

				break;
			}
			// Render the power up sprite if still room to render on screen
			else{
				thePowerUpsSprite.render(thePowerUpsX, 8);
				thePowerUpsX -= 17;
			}
		}
	}
}
