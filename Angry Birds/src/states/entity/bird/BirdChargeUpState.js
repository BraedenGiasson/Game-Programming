import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Bird from "../../../entities/Bird.js";
import BirdStateName from "../../../enums/BirdStateName.js";


export default class BirdChargeUpState extends State {
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
	}

	enter() {
		this.bird.animation = new Animation(Bird.BLACK_BIRD_ANIMATION_INDEXES, 0.125, 1);
	}

	update(dt) {
		super.update(dt);

		if (this.bird.animation.isDone()){
			this.bird.stateMachine.change(BirdStateName.Exploding);
		}
	}
}
