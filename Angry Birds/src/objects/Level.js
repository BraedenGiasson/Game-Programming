import Background from "./Background.js";
import Ground from "../entities/Ground.js";
import Slingshot from "./Slingshot.js";
import Fortress from "./Fortress.js";
import BirdQueue from "./BirdQueue.js";
import {
	context,
	DEBUG,
	matter,
	world
} from "../globals.js";
import BodyType from "../enums/BodyType.js";
import Explosion from "../entities/Explosion.js";

export default class Level {
	static MAX_STARS = 3;
	static MIN_STARS = 1;

	/**
	 * The Level contains all the pieces to play the game.
	 *
	 * @param {number} number The current level's number.
	 * @param {Fortress} fortress
	 * @param {BirdQueue} birdQueue
	 */
	constructor(number, fortress, birdQueue) {
		this.number = number;
		this.fortress = fortress;
		this.birdQueue = birdQueue;
		this.initialBirdQueueLength = birdQueue.birds.length;
		this.slingshot = new Slingshot(birdQueue);
		this.ground = new Ground();
		this.background = new Background();
	}

	update(dt) {
		this.fortress.update(dt);
		this.slingshot.update(dt);
		this.birdQueue.update(dt);
	}

	render() {
		this.background.render();
		this.renderStatistics();
		this.birdQueue.render();
		this.slingshot.render();
		this.fortress.render();
		this.ground.render();
	}

	renderStatistics() {
		context.fillStyle = 'navy';
		context.font = '60px AngryBirds';
		context.fillText(`Level: ${this.number}`, 50, 100);

		if (DEBUG) {
			context.fillText(`Birds: ${this.birdQueue.birds.length + (this.slingshot.bird === null ? 0 : 1)}`, 50, 190);
			context.fillText(`Blocks: ${this.fortress.blocks.length}`, 50, 280);
			context.fillText(`Pigs: ${this.fortress.pigs.length}`, 50, 370);
			context.fillText(`Bodies: ${matter.Composite.allBodies(world).length - 1}`, 50, 460);

			let explosions = matter.Composite.allBodies(world)
				.filter((body) => body.entity instanceof Explosion)
				.length;

			context.fillText(`Explosions: ${explosions}`, 300, 100);
		}
	}

	didWin() {
		return this.fortress.areNoPigsLeft();
	}

	didLose() {
		return this.birdQueue.areNoBirdsLeft() && this.slingshot.isEmpty();
	}

	/**
	 * Gets the number of stars to award the player.
	 * @returns The number of stars to award the player.
	 */
	numberOfStarsToAward(){
		if (!this.didWin()) return;

		let numberOfTries = this.initialBirdQueueLength - this.birdQueue.birds.length;

		// Award 1 star if it took the player all birds to win
		if (this.birdQueue.areNoBirdsLeft()){
			return 1;
		}
		// Award 3 stars if it took the player only 1 bird to win
		else if (this.birdQueue.birds.length === this.initialBirdQueueLength - 1){
			return 3;
		}
		else{
			// If there was only 3 birds, and it took 2 tries, award 2 stars
			if (this.initialBirdQueueLength === 3){
				return 2;
			}

			return this.calculateNumberOfStars(numberOfTries);
		}
	}

	/**
	 * Calculates the number of stars based on statistics.
	 * @param {*} numberOfTries The number of tries the user took to win.
	 * @returns The number of stars to award the user.
	 */
	calculateNumberOfStars(numberOfTries){
		// Get the calculated amount of awards
		let decimalAmountAwards = this.initialBirdQueueLength / numberOfTries;
		// Get the whole number of the calculated amount of awards
		let wholeNumberAmountAwards = Math.trunc(decimalAmountAwards);
		// Get the difference to check to ceil or floor
		let difference = Math.abs(wholeNumberAmountAwards - decimalAmountAwards);

		// Ceil the amount of stars if the difference is greater than; otherwise floor value
		let numStarsToAward = difference >= 0.5
							? Math.ceil(decimalAmountAwards)
							: Math.floor(decimalAmountAwards);
		
		// Set to 3 stars if the number exceeds the max stars
		if (numStarsToAward > Level.MAX_STARS) numStarsToAward = Level.MAX_STARS;
		// Set to 1 stars if the number exceeds the min stars
		if (numStarsToAward < Level.MIN_STARS) numStarsToAward = Level.MIN_STARS;

		return numStarsToAward;
	}
}
