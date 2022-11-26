import State from "./State.js";
import SpriteManager from "../SpriteManager.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, keys, stateMachine, States } from "../globals.js";

/**
 * The state in which we are waiting to serve the ball; here, we are
 * basically just moving the paddle left and right with the ball until we
 * press Enter, though everything in the actual game now should render in
 * preparation for the serve, including our current health and score, as
 * well as the level we're on.
 */
export default class ServeState extends State {
	constructor() {
		super();
	}

	enter(parameters) {
		this.paddle = parameters.paddle;
		this.balls = parameters.balls;
		this.bricks = parameters.bricks;
		this.health = parameters.health;
		this.score = parameters.score;
		this.userInterface = parameters.userInterface;
		this.level = parameters.level;
		this.collectedPowerUps = parameters.collectedPowerUps;
		this.fallingPowerUps = parameters.fallingPowerUps;
		this.keyCollectedPowerUps = parameters.keyCollectedPowerUps;
		this.keyFallingPowerUps = parameters.keyFallingPowerUps;
	}

	update(dt) {
		this.paddle.update(dt);

		this.balls.getAllBalls().forEach((ball) => {
			ball.x = this.paddle.x + (this.paddle.width / 2) - ball.width / 2;
			ball.y = this.paddle.y - ball.height;
		})

		if (keys.Enter) {
			keys.Enter = false;

			// Pass in all important state info to the PlayState.
			stateMachine.change(States.Play, {
				paddle: this.paddle,
				bricks: this.bricks,
				health: this.health,
				score: this.score,
				balls: this.balls,
				userInterface: this.userInterface,
				level: this.level,
				collectedPowerUps: this.collectedPowerUps,
				fallingPowerUps: this.fallingPowerUps,
				keyFallingPowerUps: this.keyFallingPowerUps,
				keyCollectedPowerUps: this.keyCollectedPowerUps
			});
		}
	}

	render() {
		this.userInterface.render();

		this.bricks.forEach((brick) => {
			if (brick.inPlay) brick.render();
		});

		this.paddle.render();

		this.balls.getAllBalls().forEach((ball) => {
			ball.render();
		})

		this.fallingPowerUps.getAllFallingPowerUps().forEach((powerUp) => {
			powerUp.render();
		})

		/**
		 * Renders the enter serve text.
		 */
		context.save();
		context.fillStyle = "white";
		context.font = "20px Joystix";
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText(`Press Enter to serve!`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.65);
		context.restore();

		/**
		 * Renders the press u for power up text.
		 */
		context.save();
		context.fillStyle = "white";
		context.font = "11px Joystix";
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText(`(Press 'U' to use power ups!)`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.725);
		context.restore();
	}
}
