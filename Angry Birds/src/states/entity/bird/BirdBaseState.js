import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Bird from "../../../entities/Bird.js";
import GameEntity from "../../../entities/GameEntity.js";
import BirdStateName from "../../../enums/BirdStateName.js";

export default class BirdBaseState extends State {
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

	}
}
