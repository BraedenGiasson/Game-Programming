import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	keys,
	sounds,
	stateMachine,
	States,
	TILE_SIZE
} from "../globals.js";
import State from "./State.js";

/**
 * Represents the state of the game in which we are actively playing;
 * player should control the paddle, with the ball actively bouncing between
 * the bricks, walls, and the paddle. If the ball goes below the paddle, then
 * the player should lose one point of health and be taken either to the Game
 * Over screen if at 0 health or the Serve screen otherwise.
 */
export default class PlayState extends State {
	constructor() {
		super();

		this.baseScore = 10;
		this.LOCKED_BRICK_TIMES_AMOUNT = 4;
		this.NO_POWER_UPS = 0;
		this.NO_KEY_POWER_UPS = 0;
		this.NO_BALLS = 0;
		this.NO_HEALTH = 0;
		this.previousScore = 0;
		this.BASE_TIER = 0;
	}

	enter(parameters) {
		this.paddle = parameters.paddle;
		this.bricks = parameters.bricks;
		this.health = parameters.health;
		this.score = parameters.score;
		this.balls = parameters.balls;
		this.userInterface = parameters.userInterface;
		this.level = parameters.level;
		this.collectedPowerUps = parameters.collectedPowerUps;
		this.fallingPowerUps = parameters.fallingPowerUps;
		this.keyCollectedPowerUps = parameters.keyCollectedPowerUps;
		this.keyFallingPowerUps = parameters.keyFallingPowerUps;
	}

	checkVictory() {
		/**
		 * The every method executes the provided callback function once for
		 * each element present in the array until it finds the one where callback
		 * returns a falsy value. If such an element is found, the every method
		 * immediately returns false. Otherwise, if callback returns a truthy value
		 * for all elements, every returns true.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
		 */

		// Filter out the bricks that are still in play
		let filteredArrayInPlay = this.bricks.filter((brick) => brick.inPlay);
		// Avoid soft lock, and proceed to next level
		return filteredArrayInPlay.every(brick => brick.isLockedBrick && brick.inPlay);
	}

	/**
	 * Checks to increase the paddle sizes.
	 */
	 checkPaddleIncrease(){
		const GROW_0_TO_1 = 50;
		const GROW_1_TO_2 = 100;
		const GROW_2_TO_3 = 200;
		
		const PADDLE_SIZE_0 = 0;
		const PADDLE_SIZE_1 = 1;
		const PADDLE_SIZE_2 = 2;

		// Checks to increase the paddle size from size 0 --> 1
		if (this.previousScore === GROW_0_TO_1 && this.paddle.size === PADDLE_SIZE_0) {
			this.paddle.checkToGrow(GROW_0_TO_1);
			this.previousScore = 0;
		}
		// Checks to increase the paddle size from size 1 --> 2
		else if (this.previousScore === GROW_1_TO_2 && this.paddle.size === PADDLE_SIZE_1) {
			this.paddle.checkToGrow(GROW_1_TO_2);
			this.previousScore = 0;
		}
		// Checks to increase the paddle size from size 2 --> 3
		else if (this.previousScore === GROW_2_TO_3 && this.paddle.size === PADDLE_SIZE_2) {
			this.paddle.checkToGrow(GROW_2_TO_3);
			this.previousScore = 0;
		}
	}
	
	/**
	 * Determines if a power up should spawn from the collided brick.
	 * @param {*} tier The tier of the brick that was hit.
	 * @param {*} ball The ball that collided with the brick.
	 */
	determineIfSpawnPowerUp(tier, ball){
		// Ensures to only add a power up if the brick is at the base tier (when brick is broken)
		if(tier === this.BASE_TIER){
			// Check to spawn normal power up
			let isPowerUp = this.fallingPowerUps.handlePowerUp(ball.x, ball.y);

			// Check to spawn key power up 
			if(!isPowerUp) this.keyFallingPowerUps.handleKeyPowerUp(ball.x, ball.y);	
		}
	}

	/**
	 * Handles the spawning of a new ball.
	 */
	handleSpawnNewBall(){
		// Removes a power up and spawns a new ball if the 'u' key was pressed
		if(keys.u && this.collectedPowerUps.getAllCollectedPowerUps().length > this.NO_POWER_UPS){
			// Remove a power up
			this.collectedPowerUps.removeCollectedPowerUp();

			// Add a new ball to the game
			this.balls.addNewBall();

			// Update the UI
			this.userInterface.update(
				this.health, 
				this.score,
				this.collectedPowerUps,
				this.keyCollectedPowerUps,
				this.level,
			);

			// Reset keys so it doesn't loop
			keys.u = false;
		}
	}

	/**
	 * Handles the collision a ball has with the paddle.
	 */
	handleBallCollisionWithPaddle(){
		// Loop over each ball
		this.balls.getAllBalls().forEach((ball) => {
			// If the current ball collided with the paddle
			if (ball.didCollide(this.paddle)) {
				// Flip y velocity and reset position to on top of the paddle.
				ball.dy *= -1;
				ball.y = CANVAS_HEIGHT - TILE_SIZE * 2 - TILE_SIZE / 2;
	
				// Vary the angle of the ball depending on where it hit the paddle.
				ball.handlePaddleCollision(this.paddle);
	
				sounds.paddleHit.play();
			}
		})
	}

	/**
	 * Handles the changing of the score.
	 * @param {*} brick The brick that was hit.
	 */
	handleScoreChange(brick){
		// Hold the current score
		this.currentPreviousScore = this.score;

		// Checks if the brick is a locked brick
		if (brick.isLockedBrick){
			// If the locked brick isn't in play, add the score, otherwise nothing
			if (!brick.inPlay) this.score += this.baseScore * this.LOCKED_BRICK_TIMES_AMOUNT;
		}
		// Add the score for a normal brick
		else this.score += this.baseScore * (brick.tier + 1);;

		// Get the difference from the new score
		this.difference = this.score - this.currentPreviousScore;
		// Setting the score to upgrade the paddle
		this.previousScore += this.difference;
	}

	/**
	 * Handles what happens if there's a victory (to move onto the next level).
	 */
	handleIfVictory(){
		// Checks if a victory occurred
		if (this.checkVictory()) {
			sounds.victory.play();
			
			// Reset
			this.fallingPowerUps.resetFallingPowerUps();
			this.keyFallingPowerUps.resetKeyFallingPowerUps();
			this.balls.resetBalls();

			// Update the UI
			this.userInterface.update(
				this.health, 
				this.score,
				this.collectedPowerUps,
				this.keyCollectedPowerUps,
				this.level
			);

			// Change the state to victory
			stateMachine.change(States.Victory, {
				level: this.level,
				paddle: this.paddle,
				health: this.health,
				score: this.score,
				balls: this.balls,
				userInterface: this.userInterface,
				collectedPowerUps: this.collectedPowerUps,
				fallingPowerUps: this.fallingPowerUps,
				keyFallingPowerUps: this.keyFallingPowerUps,
				keyCollectedPowerUps: this.keyCollectedPowerUps
			});
		}
	}

	/**
	 * Handles what happens with the falling power ups.
	 * @param {*} dt The delta time.
	 */
	handleFallingPowerUps(dt){
		// Updates the falling power ups
		this.fallingPowerUps.getAllFallingPowerUps().forEach((powerUp) => {
			// If the power up collided with the paddle
			if (powerUp.active && powerUp.didCollide(this.paddle)) {
				powerUp.hit();
				this.collectedPowerUps.addCollectedPowerUp(powerUp);
			}
			// If the power up fell below the screen
			else if (powerUp.didFall()) powerUp.fell();
			// Otherwise update the location of the falling power up
			else powerUp.update(dt);

			// Update the UI
			this.userInterface.update(
				this.health, 
				this.score,
				this.collectedPowerUps,
				this.keyCollectedPowerUps,
				this.level
			);
		})
	}

	/**
	 * Handles what happens with the key falling power ups.
	 * @param {*} dt The delta time.
	 */
	handleKeyFallingPowerUps(dt){
		// Updates the falling key power ups
		this.keyFallingPowerUps.getAllKeyFallingPowerUps().forEach((keyPowerUp) => {
			// If the key power up collided with the paddle
			if (keyPowerUp.active && keyPowerUp.didCollide(this.paddle)) {
				keyPowerUp.hit();
				this.keyCollectedPowerUps.addKeyCollectedPowerUp(keyPowerUp);
			}
			// If the key power up fell below the screen
			else if (keyPowerUp.didFall()) keyPowerUp.fell();
			// Otherwise update the location of the falling key power up
			else keyPowerUp.update(dt);

			// Update the UI
			this.userInterface.update(
				this.health, 
				this.score,
				this.collectedPowerUps,
				this.keyCollectedPowerUps,
				this.level
			);
		})
	}

	/**
	 * Handles the collision a ball has with a brick.
	 * @param {*} dt The delta time.
	 */
	handleBallCollisionWithBrick(dt){
		// Loop over each brick on the screen
		this.bricks.forEach((brick) => {
			// Loop over each ball on the screen
			this.balls.getAllBalls().forEach((ball) => {
				// Checks if the brick is inPlay (not destroyed) and if the ball collided with said brick
				if (brick.inPlay && ball.didCollide(brick)) {
					// Hold the current tier of the brick as it will be changed when calling hit()
					const currentBrickTier = brick.tier;

					// Checks if the brick that was hit is a locked brick
					if(brick.isLockedBrick){
						// Checks if there are any key power ups, if so, use 1
						if(this.keyCollectedPowerUps.getNumberOfKeyCollectedPowerUps() > this.NO_KEY_POWER_UPS){
							// Remove a key power up
							this.keyCollectedPowerUps.removeKeyCollectedPowerUp();
							brick.hit();
						}
					}
					// A normal brick hit
					else brick.hit();	
					
					// Change score
					this.handleScoreChange(brick);

					// Checks to increase the paddle size
					this.checkPaddleIncrease();

					// Only spawn power up if it's a normal brick
					if(!brick.isLockedBrick) this.determineIfSpawnPowerUp(currentBrickTier, ball);

					// Update the UI
					this.userInterface.update(
						this.health, 
						this.score,
						this.collectedPowerUps,
						this.keyCollectedPowerUps,
						this.level,
					);

					// Check for victory
					this.handleIfVictory();

					// Handle the collision
					ball.handleBrickCollision(brick);
				}
			})

			// Handle falling power ups
			this.handleFallingPowerUps(dt);

			// Handle key falling power ups
			this.handleKeyFallingPowerUps(dt);
		});
	}

	/**
	 * Handles the ball following off the screen.
	 */
	handleBallFallingOffScreen(){
		// Checks if the ball fell off the screen
		for (let i = 0; i < this.balls.getNumberOfBalls(); i++) {
			// Get the ball at the current index
			let ball = this.balls.getBallAtIndex(i);
			
			// If the ball fell below the screen
			if (ball.didFall()) {
				// Remove a ball at the index
				this.balls.removeBall(i);
				
				// Reset
				this.keyFallingPowerUps.resetKeyFallingPowerUps();
				this.fallingPowerUps.resetFallingPowerUps();

				// Only continue if all the balls fell below the screen
				if (this.balls.getNumberOfBalls() === this.NO_BALLS) {
					this.health--;
					this.paddle.changeSize(this.paddle.getSize() - 1);
					this.previousScore = 0;
	
					// Update the UI
					this.userInterface.update(
								this.health, 
								this.score,
								this.collectedPowerUps,
								this.keyCollectedPowerUps,
								this.level,
					);
	
					sounds.hurt.play();
		
					// Checks if all healths are gone, then then the game is done
					if (this.health === this.NO_HEALTH && this.balls.getNumberOfBalls() === this.NO_BALLS) {
						// Reset
						this.balls.resetBalls();
						this.keyCollectedPowerUps.resetKeyCollectedPowerUps();
						this.collectedPowerUps.removeCollectedPowerUp();

						stateMachine.change(States.GameOver, {
							score: this.score
						});
					}
					// Continue playing and change to serve
					else {
						// Reset
						this.balls.resetBalls();
						this.collectedPowerUps.resetCollectedPowerUps();
						/**
						 * Don't reset all key power ups collected because there might not be enough bricks left,
						 * so instead deduct 1 key power up as a sort of loss for losing a life.
						 */
						this.keyCollectedPowerUps.removeKeyCollectedPowerUp();

						stateMachine.change(States.Serve, {
							paddle: this.paddle,
							balls: this.balls,
							bricks: this.bricks,
							health: this.health,
							score: this.score,
							userInterface: this.userInterface,
							level: this.level,
							collectedPowerUps: this.collectedPowerUps,
							fallingPowerUps: this.fallingPowerUps,
							keyFallingPowerUps: this.keyFallingPowerUps,
							keyCollectedPowerUps: this.keyCollectedPowerUps
						});
					}
				}
			}
		}
	}

	update(dt) {
		// If the screen is paused, wait for unpase check
		if (this.paused) {
			if (keys.p) {
				keys.p = false;
				this.paused = false;
				sounds.pause.play();
			}
			else {
				return;
			}
		}
		// If the 'p' key is pressed, set the state to paused
		else if (keys.p) {
			keys.p = false;
			this.paused = true;
			sounds.pause.play();
			return;
		}

		// Handle spawning a new ball
		this.handleSpawnNewBall();

		// Handle ball colliding with paddle
		this.handleBallCollisionWithPaddle();

		// Handle ball colliding with brick
		this.handleBallCollisionWithBrick(dt);

		// Handle ball falling off screen
		this.handleBallFallingOffScreen();

		// Update
		this.paddle.update(dt);
		this.balls.getAllBalls().forEach((ball) => {
			ball.update(dt);
		})
		this.bricks.forEach((brick) => {
			brick.update(dt);
		});
	}

	render() {
		this.userInterface.render();
		this.paddle.render();
		this.balls.getAllBalls().forEach((ball) => {
			ball.render();
		})

		this.bricks.forEach((brick) => {
			brick.render();
		});

		this.fallingPowerUps.getAllFallingPowerUps().forEach((powerUp) => {
			powerUp.render();
		})

		this.keyFallingPowerUps.getAllKeyFallingPowerUps().forEach((keyPowerUp) => {
			keyPowerUp.render();
		})

		if (this.paused) {
			context.save();
			context.font = "50px Joystix";
			context.fillStyle = "white";
			context.textBaseline = 'middle';
			context.textAlign = 'center';
			// context.fillText(`⏸`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5);
			context.fillText(`PAUSED`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5);
			context.restore();
		}
	}
}
