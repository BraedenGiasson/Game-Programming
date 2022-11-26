import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { keys } from "../../../globals.js";
import Player from "../../../entities/Player.js";
import TypeOfCharacter from "../../../enums/TypeOfCharacter.js";
import Vector from "../../../../lib/Vector.js";

export default class PlayerJumpingState extends State {
	static firstAnimation1 = 2;
	static secondAnimation1 = 13;
	
	/**
	 * In this state, the player gets a sudden vertical
	 * boost. Once their Y velocity reaches 0, they start
	 * to fall.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.animation = !player.isInvisible
						? new Animation([PlayerJumpingState.firstAnimation1], 1)
						: new Animation([PlayerJumpingState.secondAnimation1], 1);
	}

	enter() {
		// Set new jump force if jump on entity
		if (this.player.jumpHit)
			this.player.jumpForce = new Vector(0, Player.ON_COLLISION_JUMP_HEIGHT);

		this.player.velocity.y = this.player.jumpForce.y;
		this.player.currentAnimation = !this.player.isInvisible
										? new Animation([PlayerJumpingState.firstAnimation1], 1)
										: new Animation([PlayerJumpingState.secondAnimation1], 1);
	}

	update(dt) {
		this.setFramesForPlayer();

		if (this.player.velocity.y >= 0) {
			this.resetJumpForce();

			this.player.changeState(PlayerStateName.Falling);
		}

		if (this.isTileCollisionAbove()) {
			this.player.velocity.y = 0;

			this.resetJumpForce();

			this.player.changeState(PlayerStateName.Falling);
		}
		else if (keys.a) {
			this.player.moveLeft();
			this.player.checkLeftCollisions();
		}
		else if (keys.d) {
			this.player.moveRight();
			this.player.checkRightCollisions();
		}
		else {
			this.player.stop();
		}

		this.player.checkObjectCollisions(object => this.onObjectCollision(object));
		this.player.checkEntityCollisions();
		this.player.velocity.add(this.player.gravityForce, dt);
	}

	/**
	 * Resets the jump force to default jump force.
	 */
	resetJumpForce(){
		this.player.jumpHit = false;
		this.player.jumpForce = new Vector(0, Player.DEFAULT_JUMP_HEIGHT);
	}

	isTileCollisionAbove() {
		return this.player.didCollideWithTiles([Direction.TopLeft, Direction.TopRight]);
	}

	onObjectCollision(object) {
		if (object.didCollideWithEntity(this.player)) {
			if (object.isSolid && object.getEntityCollisionDirection(this.player) === Direction.Down) {
				object.onCollision(this.player);

				this.player.position.y = object.position.y + object.dimensions.y;
				this.player.velocity.y = 0;
				this.player.changeState(PlayerStateName.Falling);
			}
			else if (object.isConsumable) {
				object.onConsume(this.player);
			}
		}
	}

	/**
	 * Sets the frames for the current player.
	 */
	setFramesForPlayer(){
		// If the player is invisible, set blue frames
		if (this.player.isInvisible)
			this.player.currentAnimation.setFrames([PlayerJumpingState.secondAnimation1]);
		// If the player is normal, set green frames	
		else
			this.player.currentAnimation.setFrames([PlayerJumpingState.firstAnimation1]);
	}
}
