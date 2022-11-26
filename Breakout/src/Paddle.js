import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	keys,
	TILE_SIZE
} from "./globals.js";
import SpriteManager from "./SpriteManager.js";

/**
 * Represents a paddle that can move left and right. Used in the main
 * program to deflect the ball toward the bricks; if the ball passes
 * the paddle, the player loses one heart. The Paddle can have a skin,
 * which the player gets to choose upon starting the game.
 */
export default class Paddle {
	constructor() {
		// X is placed in the middle.
		this.x = CANVAS_WIDTH / 2 - TILE_SIZE * 2;

		// Y is placed a little above the bottom edge of the screen.
		this.y = CANVAS_HEIGHT - TILE_SIZE * 2;

		// Start us off with no velocity.
		this.dx = 0;

		// Starting dimensions.
		this.width = TILE_SIZE * 4;
		this.height = TILE_SIZE;

		// The skin only has the effect of changing our color.
		this.skin = 0;

		/**
		 * The variant is which of the four paddle sizes we currently are;
		 * 1 is the starting size, as the smallest is too tough to start with.
		 */
		this.size = 1;

		this.MIN_SIZE = 0;
		this.MAX_SIZE = 4;

		this.paddleSpeed = 500;

		this.sprites = SpriteManager.generatePaddleSprites();

		this.GROW_0_TO_1 = 50;
		this.GROW_1_TO_2 = 100;
		this.GROW_2_TO_3 = 200;
	}

	update(dt) {
		if (keys.a) {
			this.dx = -this.paddleSpeed;
		}
		else if (keys.d) {
			this.dx = this.paddleSpeed;
		}
		else {
			this.dx = 0
		}

		if (this.dx < 0) {
			/**
			 * Math.max ensures that we're the greater of 0 or the player's
			 * current calculated Y position when pressing up so that we don't
			 * go into the negatives; the movement calculation is simply our
			 * previously-defined paddle speed scaled by dt.
			 */
			this.x = Math.max(0, this.x + this.dx * dt)
		}
		else {
			/**
			 * Math.min ensures we don't go any farther than the bottom of the
			 * screen minus the paddle's height (or else it will go partially
			 * below, since position is based on its top left corner).
			 */
			this.x = Math.min(CANVAS_WIDTH - this.width, this.x + this.dx * dt)
		}
	}

	/**
	 * Gets the size of the current paddle.
	 * @returns The size of the current paddle.
	 */
	getSize(){
		return this.size;
	}

	/**
	 * Changes the size of the paddle.
	 * @param {*} newSize The new size of the paddle.
	 */
	changeSize(newSize){
		// Only change the size if the size is within the sizing limits
		if(newSize >= this.MIN_SIZE && newSize < this.MAX_SIZE){
			this.size = newSize;
			
			// To update the width of the paddle
			switch (newSize) {
				// Smallest paddle
				case 0:
					this.width = TILE_SIZE * 2;
					break;
				case 1:
					this.width = TILE_SIZE * 4;
					break;
				case 2:
					this.width = TILE_SIZE * 6;
					break;
				// Biggest paddle
				case 3:
					this.width = TILE_SIZE * 8;
					break;
				default:
					break;
			}
		}
	}

	/**
	 * Checks to change the size of the paddle based on the specified score.
	 * @param {*} score The score that was achieved.
	 */
	checkToGrow(score){
		if(score === this.GROW_0_TO_1) this.changeSize(this.size + 1)
		else if(score === this.GROW_1_TO_2) this.changeSize(this.size + 1)
		else if(score === this.GROW_2_TO_3) this.changeSize(this.size + 1)
	}

	render() {
		// Determines which paddle to render
		this.sprites[this.size + (4 * this.skin)].render(this.x, this.y);
	}
}
