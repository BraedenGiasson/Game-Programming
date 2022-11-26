import Bird from "../Bird.js";

export default class BlackBird extends Bird {
	static BLACK_BIRD_RADIUS = 32;
	static WIDTH = 62;
	static HEIGHT = 82;

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
	 * @param {BirdType} birdType The type of bird.
	 * @param radius The radius of the bird.
	 */
	constructor(x, y, birdType) {
		super(x, y, birdType, BlackBird.BLACK_BIRD_RADIUS);
		
		this.sprites = super.generateSprites(birdType);
		this.renderOffset = { x: -BlackBird.WIDTH / 2, y: -BlackBird.HEIGHT / 2 - 10 };
	}
}
