import State from "../../../lib/State.js";
import Vector from "../../../lib/Vector.js";
import Player from "../../entities/Player.js";
import GameStateName from "../../enums/GameStateName.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	keys,
	stateMachine,
} from "../../globals.js";
import LevelMaker from "../../services/LevelMaker.js";

export default class StartState extends State {
	static STARTING_LEVEL = 1;

	constructor() {
		super();

		this.createGameComponents();
	}

	enter() {
		this.createGameComponents();
	}

	/**
	 * Creates the game level and player.
	 */
	createGameComponents(){
		this.level = LevelMaker.generateLevel(StartState.STARTING_LEVEL);

		this.player = new Player(
			new Vector(Player.WIDTH, Player.HEIGHT),
			new Vector(Player.WIDTH, 0),
			new Vector(Player.VELOCITY_LIMIT, Player.VELOCITY_LIMIT),
			this.level,
			0
		);

		LevelMaker.generateSnails(this.level, this.player);
	}

	update() {
		if (keys.Enter) {
			stateMachine.change(GameStateName.Play, {
				level: this.level,
				player: this.player
			});
		}
	}

	render() {
		this.level.render();

		this.renderTitleWindow();
	}

	renderTitleWindow() {
		context.save();
		context.fillStyle = 'rgb(0,0,0, 0.5)';
		context.fillRect(30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);
		context.font = '40px Joystix';
		context.fillStyle = 'white';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Super Alien Bros.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
		context.font = '20px Joystix';
		context.fillText('Press Enter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
		context.restore();
	}
}
