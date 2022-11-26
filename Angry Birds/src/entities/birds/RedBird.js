import Bird from "../Bird.js";

export default class RedBird extends Bird {
	static RED_BIRD_RADIUS = 20;
	static WIDTH = 45;
	static HEIGHT = 45;

	/**
	 * A bird that will be launched at the pig fortress. The bird is a
	 * dynamic (i.e. non-static) Matter body meaning it is affected by
	 * the world's physics. We've given the bird a high restitution value
	 * so that it is bouncy. The label will help us manage this body later.
	 * The collision filter ensures that birds cannot collide with eachother.
	 * We've set the density to a value higher than the block's default density
	 * of 0.001 so that the bird can actually knock blocks over.
	 *
	 * @see https://brm.io/matter-js/docs/classes/Body.html#property_restitution
	 * @see https://brm.io/matter-js/docs/classes/Body.html#property_label
	 * @see https://brm.io/matter-js/docs/classes/Body.html#property_collisionFilter
	 * @see https://brm.io/matter-js/docs/classes/Body.html#property_density
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y, birdType) {
		super(x, y, birdType, RedBird.RED_BIRD_RADIUS);
		
		this.sprites = super.generateSprites(birdType);
		this.renderOffset = { x: -25, y: -23 };
	}
}
