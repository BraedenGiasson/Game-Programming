import BodyType from "../enums/BodyType.js";
import Circle from "./Circle.js";
import GameEntity from "./GameEntity.js";
import Animation from "../../lib/Animation.js";
import RedBird from "./birds/RedBird.js";
import { matter, world } from "../globals.js";

export default class Explosion extends Circle {
	static RENDER_EXPLOSION_OFFSET = { x: 20, y: 0 };

	/**
	 * 
	 * @param {number} x
	 * @param {number} y
	 * @param {number} interval The amount of time between frames.
	 */
	constructor(
		x, 
		y, 
		interval, 
		density = 0.008, 
		isStatic = true, 
		isShrapnel = false, 
		shrapnelForce = { x: 0, y: 0 }
	) {
		super(x, y, RedBird.RED_BIRD_RADIUS, {
			label: BodyType.Explosion,
			density: density,
			restitution: 0.8,
			collisionFilter: {
				group: -1,
			},
			isStatic: isStatic
		});

		this.interval = interval;
		this.isShrapnel = isShrapnel;

		this.renderOffset = { x: -60, y: -65 };

		this.sprites = GameEntity.generateSprites(GameEntity.EXPLOSION_SPRITE_MEASUREMENTS);

		this.animation = new Animation([0, 1, 2, 3], interval, 1);
		
		if (isShrapnel){
			this.initialPositions = {
				x: x,
				y: y
			};

			this.shrapnelForce = shrapnelForce;

			matter.Body.applyForce(
				this.body, 
				this.body.position, 
				shrapnelForce
			);
		}
	}

	update(dt) {
		if (this.animation !== null && this.animation.isDone()){
			this.shouldCleanUp = true;
		}
		
		super.update(dt);
	}
}
