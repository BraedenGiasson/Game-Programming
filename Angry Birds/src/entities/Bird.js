import { keys, matter } from "../globals.js";
import BodyType from "../enums/BodyType.js";
import Circle from "./Circle.js";
import { oneInXChance } from "../../lib/RandomNumberHelpers.js";
import GameEntity from "./GameEntity.js";
import BirdTypeMeasurements from "../enums/BirdTypeMeasurements.js";
import BirdType from "../enums/BirdType.js";
import Animation from "../../lib/Animation.js";
import StateMachine from "../../lib/StateMachine.js";
import BirdStateName from "../enums/BirdStateName.js";
import BirdExplodingState from "../states/entity/bird/BirdExplodingState.js";
import BirdChargeUpState from "../states/entity/bird/BirdChargeUpState.js";
import BirdBaseState from "../states/entity/bird/BirdBaseState.js";

export default class Bird extends Circle {
	static BLACK_BIRD_ANIMATION_INDEXES = [1, 2, 3, 4];

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
	constructor(x, y, birdType, radius) {
		super(x, y, radius, {
			label: BodyType.Bird,
			density: 0.008,
			restitution: 0.8,
			collisionFilter: {
				group: -1,
			},
		});
		
		this.birdType = birdType;

		this.isWaiting = true;
		this.isJumping = false;

		this.stateMachine = this.initializeStateMachine();
	}

	/**
	 * Generates the sprites for the specified bird type.
	 * @param {*} birdType The type of bird to generate.
	 * @returns The sprites for the specified bird type.
	 */
	generateSprites(birdType){
		switch (birdType) {
			case BirdType.Red:
				return GameEntity.generateSprites(BirdTypeMeasurements.RedTypeMeasurements);
			case BirdType.Yellow:
				return GameEntity.generateSprites(BirdTypeMeasurements.YellowTypeMeasurements);
			case BirdType.Black:
				return GameEntity.generateSprites(BirdTypeMeasurements.BlackTypeMeasurements);
		}
	}

	initializeStateMachine() {
		const stateMachine = new StateMachine();

		stateMachine.add(BirdStateName.ChargeUp, new BirdChargeUpState(this));
		stateMachine.add(BirdStateName.Exploding, new BirdExplodingState(this));
		stateMachine.add(BirdStateName.Base, new BirdBaseState(this));

		stateMachine.change(BirdStateName.Base);

		return stateMachine;
	}

	update(dt) {
		super.update(dt);

		this.stateMachine.update(dt);

		if (this.isWaiting) {
			this.randomlyJump();
		}
	}

	render(){
		// Only render the bird it's not exploding
		if (this.stateMachine.currentState.name !== BirdStateName.Exploding){
			super.render();
		}

		this.stateMachine.render();
	}

	randomlyJump() {
		if (!this.isJumping && oneInXChance(1000)) {
			this.jump();
		}

		if (this.isOnGround()) {
			this.isJumping = false;
		}
	}

	jump() {
		this.isJumping = true;

		// https://brm.io/matter-js/docs/classes/Body.html#method_applyForce
		matter.Body.applyForce(this.body, this.body.position, { x: 0.0, y: -0.2 });
	}

	getBirdType(){
		return this.birdType;
	}

	getAnimation(){
		return this.animation;
	}

	isRedBird() {
		return this.birdType == BirdType.Red;
	}
	
	isBlackBird() {
		return this.birdType == BirdType.Black;
	}

	isYellowBird() {
		return this.birdType == BirdType.Yellow;
	}
}
