import State from "../../../../lib/State.js";
import Bird from "../../../entities/Bird.js";
import Explosion from "../../../entities/Explosion.js";
import ExplosionSprite from "../../../entities/ExplosionSprite.js";
import SoundName from "../../../enums/SoundName.js";

import {
	matter,
	sounds,
	world
} from "../../../globals.js";

const {
	Body,
	Composite,
	Constraint,
	Events,
	Mouse,
	MouseConstraint,
	Vector,
} = matter;

export default class BirdExplodingState extends State {
	/**
	 * In this state, the player can move around using the
	 * directional keys. From here, the player can go idle
	 * if no keys are being pressed. The player can also swing
	 * their sword if they press the spacebar.
	 *
	 * @param {Bird} bird
	 */
	constructor(bird) {
		super();

		this.bird = bird;
		this.explosions = [];
		this.shrapnelExplosions = [];
	}

	enter() {
		// Add the exploding sprite
		this.explodingSprite = new ExplosionSprite(
			this.bird.body.position.x + 20, 
			this.bird.body.position.y - 30,
			0.001
		);

		sounds.play(SoundName.Kill);

		this.addShrapnel();
		this.addExplosions();
	}

	/**
	 * Adds the explosions for the bird.
	 */
	addExplosions(){
		this.explosions.push(new Explosion(
			this.bird.body.position.x - ((this.bird.sprites[0].width / 2)) - 30,
			this.bird.body.position.y - 40,
			0.1
		))
		
		this.explosions.push(new Explosion(
			this.bird.body.position.x ,
			this.bird.body.position.y - 40,
			0.1
		))
	}
	
	/**
	 * Adds the shrapnel explosions from the bird explosion.
	 */
	addShrapnel(){
		// Top left shrapnel
		this.shrapnelExplosions.push(new Explosion(
			this.bird.body.position.x,
			this.bird.body.position.y,
			0.085,
			0.08,
			false,
			true,
			{ x: -2, y: -2.5 }
		))
		// Top left middle shrapnel
		this.shrapnelExplosions.push(new Explosion(
			this.bird.body.position.x,
			this.bird.body.position.y,
			0.085,
			0.08,
			false,
			true,
			{ x: -0.75, y: -2.5 }
		))
		// Top right middle shrapnel
		this.shrapnelExplosions.push(new Explosion(
			this.bird.body.position.x,
			this.bird.body.position.y,
			0.085,
			0.08,
			false,
			true,
			{ x: 0.75, y: -2.5 }
		))
		// Top right shrapnel
		this.shrapnelExplosions.push(new Explosion(
			this.bird.body.position.x,
			this.bird.body.position.y,
			0.085,
			0.08,
			false,
			true,
			{ x: 2, y: -2.5 }
		))
		// // Bottom left shrapnel
		this.shrapnelExplosions.push(new Explosion(
			this.bird.body.position.x,
			this.bird.body.position.y,
			0.085,
			0.08,
			false,
			true,
			{ x: -2, y: 0 }
		))
		// Bottom right shrapnel
		this.shrapnelExplosions.push(new Explosion(
			this.bird.body.position.x,
			this.bird.body.position.y,
			0.085,
			0.08,
			false,
			true,
			{ x: 2, y: 0 }
		))
	}

	update(dt){
		super.update(dt);
		this.bird.body.angularSpeed = 0;

		// Remove the exploding sprite when 1 of the exploding animations is done
		if (this.explosions.some((explosion) => explosion.animation.isHalfwayDone())) {
			this.explodingSprite.shouldCleanUp = true;
		}
		// Otherwise update the exploding sprite
		else if (!this.explodingSprite.shouldCleanUp) {
			this.explodingSprite.update(dt);
		}
		
		// If all explosion animations are done, the bird should be cleaned up
		if (this.explosions.every((explosion) => explosion.shouldCleanUp)) 
		{
			this.shrapnelExplosions.forEach((explosion) => explosion.shouldCleanUp = true);

			this.bird.shouldCleanUp = true;

			this.explosions = this.explosions.filter((explosion) => !explosion.shouldCleanUp);
		}
		// Otherwise update the explosion 
		else {
			this.shrapnelExplosions.forEach((shrapnelExplosion) => shrapnelExplosion.update(dt));
			this.explosions.forEach((explosion) => explosion.update(dt));
		}
	}

	render(){
		// Render the exploding sprite
		if (!this.explodingSprite.shouldCleanUp){
			this.explodingSprite.render();
		}

		// this.shrapnelExplosions.forEach((shrapnelExplosion) => shrapnelExplosion.render());
		this.explosions.forEach((explosion) => explosion.render({ x: 1.5, y: 1.5 }));
	}
}
