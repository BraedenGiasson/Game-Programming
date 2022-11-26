import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import TypeOfCharacter from "../../../enums/TypeOfCharacter.js";
import { keys } from "../../../globals.js";

export default class PlayerIdleState extends State {
	static firstAnimation1 = 0;
	static secondAnimation1 = 11;

	/**
	 * In this state, the player is stationary unless
	 * left or right are pressed, or if there is no
	 * collision below.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.animation = !player.isInvisible
						? new Animation([PlayerIdleState.firstAnimation1], 1)
						: new Animation([PlayerIdleState.secondAnimation1], 1);
	}

	enter() {
		this.player.currentAnimation = !this.player.isInvisible
										? new Animation([PlayerIdleState.firstAnimation1], 1)
										: new Animation([PlayerIdleState.secondAnimation1], 1);
	}

	update() {
		this.setFramesForPlayer();

		this.player.checkLeftCollisions();
		this.player.checkRightCollisions();
		this.player.checkEntityCollisions();

		const collisionObjects = this.player.checkObjectCollisions();

		if (collisionObjects.length === 0 && !this.isTileCollisionBelow()) {
			this.player.changeState(PlayerStateName.Falling);
		}

		if (keys.a || keys.d) {
			this.player.changeState(PlayerStateName.Walking);
		}

		if (keys[' ']) {
			this.player.changeState(PlayerStateName.Jumping);
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
			this.player.currentAnimation.setFrames([PlayerIdleState.secondAnimation1]);
		// If the player is normal, set green frames	
		else
			this.player.currentAnimation.setFrames([PlayerIdleState.firstAnimation1]);
	}
}
