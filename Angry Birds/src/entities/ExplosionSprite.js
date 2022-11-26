import BodyType from "../enums/BodyType.js";
import Circle from "./Circle.js";
import GameEntity from "./GameEntity.js";

export default class ExplosionSprite extends Circle {
	static SPRITE_MEASUREMENTS =  [
        { x: 676, y: 360, width: 88, height: 86 } // 90
    ];
	static RADIUS = 0;

	/**
	 * 
	 * @param {number} x
	 * @param {number} y
	 * @param {number} interval The amount of time between frames.
	 */
	constructor(x, y, interval) {
		super(x, y, ExplosionSprite.RADIUS, {
			label: BodyType.Explosion,
			density: 0.008,
			restitution: 0.8,
			collisionFilter: {
				group: -1,
			},
			isStatic: true
		});

		this.renderOffset = { 
			x: -(ExplosionSprite.SPRITE_MEASUREMENTS[0].width / 2), 
			y: -(ExplosionSprite.SPRITE_MEASUREMENTS[0].height / 2 )
		};

		this.sprites = GameEntity.generateSprites(ExplosionSprite.SPRITE_MEASUREMENTS);

		this.currentFrame = 0;
	}
}
