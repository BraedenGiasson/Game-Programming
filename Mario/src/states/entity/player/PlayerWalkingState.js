import { keys } from "../../../globals.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import State from "../../../../lib/State.js";
import Animation from "../../../../lib/Animation.js";
import Player from "../../../entities/Player.js";
import TypeOfCharacter from "../../../enums/TypeOfCharacter.js";

export default class PlayerWalkingState extends State {
	static firstAnimation1 = 9;
	static firstAnimation2 = 10;
	static secondAnimation1 = 20;
	static secondAnimation2 = 21;

	/**
	 * In this state, the player is on the ground and moving
	 * either left or right. From here, the player can go idle
	 * if nothing is being pressed and there is no X velocity.
	 * The player can fall if there is no collisions below them,
	 * and they can jump if they hit spacebar.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.animation = !player.isInvisible
						? new Animation([PlayerWalkingState.firstAnimation1, PlayerWalkingState.firstAnimation2], 0.2)
						: new Animation([PlayerWalkingState.secondAnimation1, PlayerWalkingState.secondAnimation2], 0.2);
	}

	enter() {
		this.player.currentAnimation = !this.player.isInvisible
										? new Animation([PlayerWalkingState.firstAnimation1, PlayerWalkingState.firstAnimation2], 0.2)
										: new Animation([PlayerWalkingState.secondAnimation1, PlayerWalkingState.secondAnimation2], 0.2);
	}

	update(dt) {
		this.setFramesForPlayer();

		this.player.checkLeftCollisions();
		this.player.checkRightCollisions();
		this.player.checkEntityCollisions();

		const collisionObjects = this.player.checkObjectCollisions();

		if (keys[' ']) {
			this.player.changeState(PlayerStateName.Jumping);
		}

		if (!keys.a && !keys.d && Math.abs(this.player.velocity.x) === 0) {
			this.player.changeState(PlayerStateName.Idle);
		}
		else if (collisionObjects.length === 0 && !this.isTileCollisionBelow()) {
			this.player.changeState(PlayerStateName.Falling);
		}
		else if (keys.a) {
			this.player.moveLeft();
		}
		else if (keys.d) {
			this.player.moveRight();
		}
		else {
			this.player.stop();
		}
	}

	isTileCollisionBelow() {
		return this.player.didCollideWithTiles([Direction.BottomLeft, Direction.BottomRight]);
	}

	/**
	 * Sets the frames for the current player.
	 */
	setFramesForPlayer(){
		// If the player is invisible, set blue frames
		if (this.player.isInvisible)
			this.player.currentAnimation.setFrames([PlayerWalkingState.secondAnimation1, PlayerWalkingState.secondAnimation2]);
		// If the player is normal, set green frames	
		else
			this.player.currentAnimation.setFrames([PlayerWalkingState.firstAnimation1, PlayerWalkingState.firstAnimation2]);
	}
}
