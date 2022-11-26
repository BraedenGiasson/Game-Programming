import Bird from "../Bird.js";
import { keys, matter, sounds } from "../../globals.js";
import BirdType from "../../enums/BirdType.js";
import SoundName from "../../enums/SoundName.js";

export default class YellowBird extends Bird {
	static YELLOW_BIRD_RADIUS = 28;
	static WIDTH = 58;
	static HEIGHT = 54;

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
		super(x, y, birdType, YellowBird.YELLOW_BIRD_RADIUS);
		
		this.sprites = super.generateSprites(birdType);
		this.renderOffset = { x: -YellowBird.WIDTH / 2, y: -YellowBird.HEIGHT / 2  };
	}

	/**
	 * Checks to accelerate the yellow bird.
	 * @param wasLaunched True if the bird was launched from the slingshot; otherwise false.
	 * @returns True if the bird is yellow and should accelerate; otherwise false.
	 */
	 checkToAccelerate(wasLaunched){
		return this.birdType === BirdType.Yellow 
			&& wasLaunched 
			&& keys[' '];
	}

	/**
	 * Accelerates the yellow bird.
	 */
	accelerate(){
		sounds.play(SoundName.Bounce);
		
		matter.Body.applyForce(
			this.body, 
			this.body.position, 
			{ 
				x: this.body.velocity.x / 5 ,
				y: this.body.velocity.y / 5 
			} 
		);

		keys[' '] = false;
	}
}
