import { sounds, TILE_SIZE } from "./globals.js";
import Particle from "./Particle.js";
import SpriteManager from "./SpriteManager.js";
import { getRandomPositiveNumber } from "./utils.js";

export default class LockedBrick {
	/**
	 * Represents a brick in the world space that the ball can collide with;
	 * differently coloured bricks have different point values. On collision,
	 * the ball will bounce away depending on the angle of collision. When all
	 * bricks are cleared in the current map, the player should be taken to a new
	 * layout of bricks.
	 *
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = TILE_SIZE * 2;
		this.height = TILE_SIZE;

		// Used to determine whether this brick should be rendered.
		this.inPlay = true;
		this.isLockedBrick = true;

		this.numberOfColours = 6;
		this.colour = Math.floor(getRandomPositiveNumber(0, this.numberOfColours - 1));

		this.sprites = SpriteManager.generateLockedBrickSprite();

		// Used to create a more visually appealing hit animation.
		this.particles = [];
		this.maxParticles = 20;

		// The RGB colours of the bricks. Used for the colour of the particles.
		this.colours = [
			{ r: 99, g: 155, b: 255 }, // blue
			{ r: 106, g: 190, b: 47 }, // green
			{ r: 217, g: 87, b: 99 }, // red
			{ r: 215, g: 123, b: 186 }, // purple
			{ r: 251, g: 242, b: 54 }, // gold
			{ r:89, g: 85, b:82 } // grey
		];
	}

	/**
	 * Gets the colours array.
	 * @returns The colours array.
	 */
	getColours(){
		return this.colours;
	}

	hit() {
		sounds.select.play();

		// Every time the brick is hit, create 20 new particles.
		for (let i = 0; i < this.maxParticles; i++) {
			this.particles.push(new Particle(
				this.x + this.width / 2,
				this.y + this.height / 2,
				this.colours[this.colour],
			));
		}

		// remove brick from play
		this.inPlay = false;
	}

	update(dt) {
		this.particles.forEach((particle) => {
			particle.update(dt);
		});

		/**
		 * The filter() method creates a new array with all elements
		 * that pass the test implemented by the provided function.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
		 */
		this.particles = this.particles.filter((particle) => particle.isAlive);
	}

	render() {
		if (this.inPlay) {
			this.sprites.render(this.x, this.y);
		}

		this.particles.forEach((particle) => {
			particle.render();
		});
	}

	/**
	 * The maximum allowed locked bricks to spawn.
	 * @param {*} skipFlag True if there's a skipping flag, otherwise false.
	 * @param {*} numberOfRows The number of rows for bricks.
	 * @param {*} numberOfColumns The number of columns for bricks.
	 * @returns The number of allowed locked bricks.
	 */
	static maxAllowedLockedBricks(skipFlag, numberOfRows, numberOfColumns){
		/**
		 * To load a locked brick let we would getting 
		 * a random number for the power ups spawning
		 */
		const maxPowerUpValue = 7;

		// Set column number (Split columns if there's a skip flag)
		let columns = skipFlag
					  ? numberOfColumns / 2
					  : numberOfColumns;

		// Get the estimated number of bricks will be
		let numEstimateBricks = numberOfRows * columns;

		/**
		 * Get the number of max locked bricks there should be
		 * (AlWAYS have at least 1)
		 */
		return Math.ceil(numEstimateBricks / maxPowerUpValue);
	}
}
