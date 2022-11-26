import Entity from "./Entity.js";
import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import TypeOfCharacter from "../enums/TypeOfCharacter.js";
import { images, keys, sounds, stateMachine } from "../globals.js";
import Level from "../objects/Level.js";
import PlayerFallingState from "../states/entity/player/PlayerFallingState.js";
import PlayerIdleState from "../states/entity/player/PlayerIdleState.js";
import PlayerJumpingState from "../states/entity/player/PlayerJumpingState.js";
import PlayerWalkingState from "../states/entity/player/PlayerWalkingState.js";
import GameObject from "../objects/GameObject.js";
import Flagpole from "../objects/Flagpole.js";
import GameStateName from "../enums/GameStateName.js";
import LevelMaker from "../services/LevelMaker.js";
import PlayerDyingState from "../states/entity/player/PlayerDyingState.js";


export default class Player extends Entity {
	static WIDTH = 16;
	static HEIGHT = 20;
	static TOTAL_SPRITES = 11;
	static VELOCITY_LIMIT = 100;
	static DEFAULT_JUMP_HEIGHT = -350;
	static ON_COLLISION_JUMP_HEIGHT = -150;
	static STARTED_INVISIBLE_TIMER = false;

	/**
	 * The hero character the player controls in the map.
	 * Has the ability to jump and will collide into tiles
	 * that are collidable.
	 *
	 * @param {Vector} dimensions The height and width of the player.
	 * @param {Vector} position The x and y coordinates of the player.
	 * @param {Vector} velocityLimit The maximum speed of the player.
	 * @param {Level} level The level that the player lives in.
	 * @param levelNumber The level number.
	 */
	constructor(dimensions, position, velocityLimit, level, score = 0) {
		super(dimensions, position, velocityLimit, level);

		this.gravityForce = new Vector(0, 1000);
		this.speedScalar = 5;
		this.frictionScalar = 0.9;

		this.jumpForce = new Vector(0, Player.DEFAULT_JUMP_HEIGHT);
		this.jumpHit = false;

		this.sprites = Player.generateSprites();
		this.typeOfCharacter = TypeOfCharacter.Green;
		this.isInvisible = this.typeOfCharacter === TypeOfCharacter.Blue;

		this.stateMachine = new StateMachine();
		this.stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
		this.stateMachine.add(PlayerStateName.Jumping, new PlayerJumpingState(this));
		this.stateMachine.add(PlayerStateName.Idle, new PlayerIdleState(this));
		this.stateMachine.add(PlayerStateName.Falling, new PlayerFallingState(this));
		this.stateMachine.add(PlayerStateName.Dying, new PlayerDyingState(this));

		this.changeState(PlayerStateName.Falling);

		this.score = score;
		
		this.timer = 0;
		this.timerId = 0;
	}

	/**
	 * Loops through the character sprite sheet and
	 * retrieves each sprite's location in the sheet.
	 *
	 * @returns The array of sprite objects.
	 */
	static generateSprites() {
		const sprites = [];

		let x = 0;

		for (let i = 0; i < (Player.TOTAL_SPRITES * 2); i++) {
			if (i === Player.TOTAL_SPRITES) x = 0;

			sprites.push(new Sprite(
				i < Player.TOTAL_SPRITES
					? images.get(ImageName.Character)
					: images.get(ImageName.BlueCharacter)
				,
				x * Player.WIDTH,
				0,
				Player.WIDTH,
				Player.HEIGHT,
			));
			
			x++;
		}

		return sprites;
	}

	moveLeft() {
		this.direction = Direction.Left;
		this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);
	}

	moveRight() {
		this.direction = Direction.Right;
		this.velocity.x = Math.min(this.velocity.x + this.speedScalar * this.frictionScalar, this.velocityLimit.x);
	}

	stop() {
		if (Math.abs(this.velocity.x) > 0) {
			this.velocity.x *= this.frictionScalar;
		}

		if (Math.abs(this.velocity.x) < 0.1) {
			this.velocity.x = 0;
		}
	}

	/**
	 * Restrict the player from:
	 *   1. Going off the left edge of the map.
	 *   2. Overlapping with collidable tiles on the left.
	 *   3. Overlapping with collidable solid game objects on the left.
	 */
	checkLeftCollisions() {
		if (this.position.x < 0) {
			this.velocity.x = 0;
			this.position.x = 0;
		}
		else if (this.didCollideWithTiles([Direction.LeftBottom, Direction.LeftTop])) {
			const tileLeftTop = this.getTilesByDirection([Direction.LeftTop])[0];
			this.velocity.x = 0;

			if (tileLeftTop) {
				this.position.x = tileLeftTop.position.x * tileLeftTop.dimensions.x + tileLeftTop.dimensions.x - 1;
			}
		}
		else {
			const collisionObjects = this.checkObjectCollisions();

			//////////////////////////////////
			if (collisionObjects.length > 0 && collisionObjects[0].getEntityCollisionDirection(this) === Direction.Right) {
				this.velocity.x = 0;
				this.position.x = collisionObjects[0].position.x + collisionObjects[0].dimensions.x - 1;
			}
		}
	}

	/**
	 * Restrict the player from:
	 *   1. Going off the right edge of the map.
	 *   2. Overlapping with collidable tiles on the right.
	 *   3. Overlapping with collidable solid game objects on the right.
	 */
	checkRightCollisions() {
		if (this.position.x > this.level.tilemap.canvasDimensions.x - this.dimensions.x) {
			this.velocity.x = 0;
			this.position.x = this.level.tilemap.canvasDimensions.x - this.dimensions.x;
		}
		else if (this.didCollideWithTiles([Direction.RightBottom, Direction.RightTop])) {
			const tileRightTop = this.getTilesByDirection([Direction.RightTop])[0];
			this.velocity.x = 0;

			if (tileRightTop) {
				this.position.x = tileRightTop.position.x * tileRightTop.dimensions.x - this.dimensions.x;
			}
		}
		else {
			const collisionObjects = this.checkObjectCollisions();

			if (collisionObjects.length > 0 && collisionObjects[0].getEntityCollisionDirection(this) === Direction.Left) {
				this.velocity.x = 0;
				this.position.x = collisionObjects[0].position.x - this.dimensions.x;
			}
		}
	}

	/**
	 * Check if we've collided with any entities and die if so.
	 *
	 * @param {Entity} entity
	 */
	onEntityCollision(entity) {
		// If the player is blue and invisible 
		if (this.isInvisible) {
			// Remove the entity is dead
			if (!entity.isDead) {
				entity.isDead = true;
			}
		}
		// If normal mode
		else{
			// If the player is falling, check to remove entity
			if (this.currentState === PlayerStateName.Falling){
				if (!entity.isDead){
					entity.isDead = true;

					// Change state to jump state when jump on entity
					this.jumpHit = true;
					this.changeState(PlayerStateName.Jumping);
				}
			}

			// Set the player to dead if the entity is dead
			if (!entity.isDead){
				// Set x velocity to zero so player goes up and down only
				this.velocity.x = 0;
				
				this.changeState(PlayerStateName.Dying);
			}
		}
	}

	/**
	 * Loops through all the entities in the current level and checks
	 * if the player collided with any of them. If so, run onCollision().
	 * If no onCollision() function was passed, use the one from this class.
	 *
	 * @param {function} onCollision What should happen when the collision occurs.
	 * @returns The collision objects returned by onCollision().
	 */
	checkEntityCollisions(onCollision = entity => this.onEntityCollision(entity)) {
		this.level.entities.forEach((entity) => {
			if (this === entity) {
				return;
			}

			if (entity.didCollideWithEntity(this)) {
				onCollision(entity);
			}
		});
	}

	/**
	 * Collects the object if the game object is solid or collidable.
	 * Fires onConsume() if the game object is consumable.
	 *
	 * @param {GameObject} object
	 * @returns All solid and collidable game objects that were collided with.
	 */
	onObjectCollision(object) {
		const collisionObjects = [];

		if (object.isSolid || object.isCollidable) {
			collisionObjects.push(object);
		}
		else if (object.isConsumable) {
			object.onConsume(this);
		}

		return collisionObjects;
	}

	/**
	 * Loops through all the game objects in the current level and checks
	 * if the player collided with any of them. If so, run onCollision().
	 * If no onCollision() function was passed, use the one from this class.
	 *
	 * @param {function} onCollision What should happen when the collision occurs.
	 * @returns The collision objects returned by onCollision().
	 */
	checkObjectCollisions(onCollision = object => this.onObjectCollision(object)) {
		let collisionObjects = [];

		this.level.objects.forEach((object) => {
			if (object.didCollideWithEntity(this)) {

				// If object that was collided with is the flagpole
				if (object instanceof Flagpole){
					if (object.wasCollided) return;
					object.onCollision(this);
				}
				else
					collisionObjects = onCollision(object);
			}
		});

		return collisionObjects;
	}

	/**
	 * Changes the character type to the specified character type.
	 * @param {*} newCharacterType The new character skin.
	 */
	changeCharacterType(newCharacterType){
		this.typeOfCharacter = newCharacterType;
		this.isInvisible = newCharacterType === TypeOfCharacter.Blue;
	}

	/**
	 * Sets the timer for the invisible player.
	 * @param {*} timer The timer.
	 * @param {*} timerId The id of the timer in the tasks.
	 */
	setTime(timer, timerId){
		this.timer = timer;
		this.timerId = timerId;
	}
}
