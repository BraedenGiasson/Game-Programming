import Camera from "../../../lib/Camera.js";
import State from "../../../lib/State.js";
import Vector from "../../../lib/Vector.js";
import { roundedRectangle } from "../../../lib/DrawingHelpers.js";
import GameStateName from "../../enums/GameStateName.js";
import SoundName from "../../enums/SoundName.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	sounds,
	stateMachine
} from "../../globals.js";
import TypeOfCharacter from "../../enums/TypeOfCharacter.js";
import LevelMaker from "../../services/LevelMaker.js";

export default class PlayState extends State {
	constructor() {
		super();
	}

	enter(parameters) {
		this.level = parameters.level;
		this.player = parameters.player;

		this.camera = new Camera(
			this.player,
			this.level.tilemap.canvasDimensions,
			new Vector(CANVAS_WIDTH, CANVAS_HEIGHT),
		);

		this.level.addEntity(this.player);
		this.level.addCamera(this.camera);

		sounds.play(SoundName.Music);
	}

	exit() {
		sounds.stop(SoundName.Music);
	}

	update(dt) {
		this.level.update(dt);
		this.camera.update();

		if (this.player.isDead) {
			stateMachine.change(GameStateName.GameOver, {
				playerScore: this.player.score
			})
		}
	}

	render() {
		this.renderViewport();
		this.renderScore();
	}

	renderViewport() {
		context.save();
		context.translate(-this.camera.position.x, this.camera.position.y);
		this.level.render();
		context.restore();
	}

	renderScore() {
		context.save();
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';

		if (this.player.typeOfCharacter === TypeOfCharacter.Green)
			roundedRectangle(context, 10, 10, 160, 50, 10, true, false);
		else
			roundedRectangle(context, 10, 10, 210, 70, 10, true, false);

		context.fillStyle = 'navy';
		context.font = '16px Joystix';

		context.textAlign = 'left';
		context.fillText(`Score:`, 20, 30);

		context.textAlign = 'right';
		context.fillText(`${String(this.player.score).padStart(5, '0')}`, 160, 30);

		context.textAlign = 'left';
		context.fillText(`Level:`, 20, 50);

		context.textAlign = 'left';
		context.fillText(`${LevelMaker.getLevelNumber()}`, 100, 50);

		// Render invisible timer if character is invisible
		if (this.player.typeOfCharacter === TypeOfCharacter.Blue) {
			context.textAlign = 'left';
			context.fillText(`Invisible Timer:`, 20, 70);

			context.textAlign = 'left';
			context.fillText(`${this.player.timer}`, 185, 70);
		}

		context.restore();
	}
}
