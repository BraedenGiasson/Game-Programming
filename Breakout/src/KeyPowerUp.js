import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	sounds,
	TILE_SIZE
} from "./globals.js";
import SpriteManager from "./SpriteManager.js";

/**
 * Represents a ball which will bounce back and forth between the sides
 * of the world space, the player's paddle, and the bricks laid out above
 * the paddle. The ball can have a colour, which is chosen at random, just
 * for visual variety.
 */
export default class KeyPowerUp {

	/**
	 * Instantiates a new instance of the PowerUp class.
	 * @param {*} x The x position of the power up.
	 * @param {*} y The y position of the power up.
	 */
	constructor(x, y) {
		this.width = TILE_SIZE;
		this.height = TILE_SIZE;
		this.x = x + TILE_SIZE / 2;
		this.y = y;
		this.dy = 0;
		this.powerUpSpeed = 500;
		this.active = true; 
		this.sprites = SpriteManager.generateKeyPowerUpSprite();
	
		this.DOWNWARD_ANGLE = -90;
		this.SLOWDOWN_SPEED = 20;
		this.FALLDOWN_SPEED = 0.015;
	}

	reset() {
		this.dx = 0;
		this.dy = 0;
		this.x = CANVAS_WIDTH / 2 - this.width / 2;
		this.y = CANVAS_HEIGHT / 2 - this.height / 2;
	}

	/**
	 * AABB collision detection that expects a target
	 * which will have an X, Y, width, and height values.
	 *
	 * @param {Object} target The target to check for collision.
	 * @returns Whether the power up collided with the target or not.
	 */
	didCollide(target) {
		/**
		 * First, check to see if the left edge of either is
		 * farther to the right than the right edge of the other.
		 * Then check to see if the bottom edge of either is
		 * higher than the top edge of the other.
		 */
		if (this.x + this.width >= target.x
			&& this.x <= target.x + target.width
			&& this.y + this.height >= target.y
			&& this.y <= target.y + target.height) {
			return true;
		}

		// If the above isn't true, they're overlapping.
		return false;
	}

	/**
	 * Occurs when the power up hits the paddle.
	 */
	hit() {
		sounds.pause.play();
		this.active = false;
	}

	/**
	 * Occurs when the power up falls below the screen.
	 */
	fell() {
		this.active = false;
	}

	/**
	 * Checks if the power up fell below the screen.
	 * @returns True if the power up fell below the screen; otherwise false.
	 */
	didFall() {
		return this.y > CANVAS_HEIGHT;
	}

	/**
	 * Updates the y position of the power up (falling downward).
	 * @param {*} dt The delta time.
	 */
	update(dt) {
		this.y -= this.DOWNWARD_ANGLE * (dt / this.SLOWDOWN_SPEED);
	}

	/**
	 * Renders the power up to show on the screen.
	 */
	render() {
		if(this.active) this.sprites.render(this.x, this.y);
	}
}
