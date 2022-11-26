import Animation from "../../../../lib/Animation.js";
import Particle from "../../../../lib/Particle.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import SoundName from "../../../enums/SoundName.js";
import { context, sounds, timer, CANVAS_HEIGHT } from "../../../globals.js";

export default class PlayerDyingState extends State {
	static firstAnimation1 = 4;
	static firstAnimation2 = 3;
	static secondAnimation1 = 15;
	static secondAnimation2 = 14;

	/**
	 * In this state, the snail disappears and generates
	 * an array of particles as its death animation.
	 *
	 * @param {Player} player
	 */
	constructor(player) {
		super();

		this.player = player;
		this.particles = [];
		this.animation = !player.isInvisible
						? new Animation([PlayerDyingState.firstAnimation1], 1)
						: new Animation([PlayerDyingState.secondAnimation1], 1);
	}

	enter() {
		// Set current animation
		this.player.currentAnimation = !this.player.isInvisible
									? new Animation([PlayerDyingState.firstAnimation1], 1)
									: new Animation([PlayerDyingState.secondAnimation1], 1);
		
		// Play sound
		sounds.play(SoundName.Death);

		for (let i = 0; i < 20; i++) {
			this.particles.push(new Particle(
				this.player.position.x + this.player.dimensions.x / 2,
				this.player.position.y + this.player.dimensions.y / 2,
				{ r: 176, g: 250, b: 20 },
				2,
				100
			));
		}

		// Tween player dying

		let playerPositionVertical = this.player.position.y;
		
		// Make the player go up
		timer.tween(this.player.position, ['y'], [this.player.position.y - 15], 0.15, () => {	
			timer.tween(this.player.position, ['y'], [playerPositionVertical], 0.15, () => {
				timer.tween(this.player.position, ['y'], [CANVAS_HEIGHT + Player.HEIGHT], 0.4, () => {
					this.player.isDead = true;
				})
			})
		})
	}

	update(dt) {
		this.particles.forEach((particle) => {
			particle.update(dt);
		});

		this.particles = this.particles.filter((particle) => particle.isAlive);
	}

	render() {
		this.particles.forEach((particle) => {
			particle.render(context);
		});
	}
}
