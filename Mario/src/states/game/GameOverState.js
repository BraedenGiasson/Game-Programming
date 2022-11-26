import State from "../../../lib/State.js";
import GameStateName from "../../enums/GameStateName.js";
import {
	stateMachine,
} from "../../globals.js";

export default class GameOverState extends State {
	static STARTING_LEVEL = 1;

	constructor() {
		super();
	}

	enter() {
		stateMachine.change(GameStateName.TitleScreen);
	}
}
