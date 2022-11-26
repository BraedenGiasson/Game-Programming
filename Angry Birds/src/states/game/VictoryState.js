import State from "../../../lib/State.js";
import GameStateName from "../../enums/GameStateName.js";
import LevelMaker from "../../services/LevelMaker.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	images,
	keys,
	stateMachine
} from "../../globals.js";
import Sprite from "../../../lib/Sprite.js";
import ImageName from "../../enums/ImageName.js";

export default class VictoryState extends State {
	static STARS_PLACEHOLDER_MEASUREMENTS = { x: 558, y: 210 };
	static STARS_PLACEHOLDER_POSITION = { 
		x: CANVAS_WIDTH / 3 + 77,
		y: CANVAS_HEIGHT / 2 + 26 
	};
	static STAR_MEASUREMENTS = { x: 130, y: 120 };
	static STAR_1_POSITION = { 
		x: VictoryState.STARS_PLACEHOLDER_POSITION.x + 20, 
		y: VictoryState.STARS_PLACEHOLDER_POSITION.y + 75 
	};
	static STAR_2_POSITION = { 
		x: VictoryState.STARS_PLACEHOLDER_POSITION.x + 197, 
		y: VictoryState.STARS_PLACEHOLDER_POSITION.y + 22
	};
	static STAR_3_POSITION = { 
		x: VictoryState.STARS_PLACEHOLDER_POSITION.x + 408, 
		y: VictoryState.STARS_PLACEHOLDER_POSITION.y + 75 
	};
	static STAR = {
		FIRST: 0,
		SECOND: 1,
		THIRD: 2
	};

	/**
	 * Displays a game over screen where the player
	 * can press enter to go back to the title screen.
	 */
	constructor() {
		super();

		this.starsPlaceholder = new Sprite(
			images.get(ImageName.StarsPlaceholder),
			0,
			0,
			VictoryState.STARS_PLACEHOLDER_MEASUREMENTS.x,
			VictoryState.STARS_PLACEHOLDER_MEASUREMENTS.y
		);

		this.stars = [];
	}

	enter(parameters) {
		this.background = parameters.background;
		this.level = parameters.level;
		this.numStarsAwarded = parameters.numStarsAwarded;

		this.setNumberOfStars();
	}

	/**
	 * Sets the number of stars to print on the screen.
	 */
	setNumberOfStars(){
		for (let i = 0; i < this.numStarsAwarded; i++) {
			this.stars.push(new Sprite(
				images.get(ImageName.Star),
				0,
				0,
				VictoryState.STAR_MEASUREMENTS.x,
				VictoryState.STAR_MEASUREMENTS.y
			))
		}
	}

	update() {
		if (keys.Enter) {
			keys.Enter = false;

			stateMachine.change(GameStateName.Play, {
				background: this.background,
				level: LevelMaker.createLevel(this.level + 1), 
			});
		}
	}

	render() {
		this.background.render();

		context.save();
		context.font = '300px AngryBirds';
		context.fillStyle = 'black';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Victory!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 90);
		context.fillStyle = 'limegreen';
		context.fillText('Victory!', CANVAS_WIDTH / 2 + 10, CANVAS_HEIGHT / 2 - 80);

		this.starsPlaceholder.render(CANVAS_WIDTH / 3 + 70, CANVAS_HEIGHT / 2 + 20);

		this.renderStars();

		context.font = '100px AngryBirds';
		context.fillStyle = 'white';
		context.fillText('Press Enter to Continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
		context.restore();
	}

	/**
	 * Renders for each star on the screen.
	 */
	renderStars(){
		this.stars.forEach((star, index) => {
			switch (index) {
				// Render the first star
				case VictoryState.STAR.FIRST:
					star.render(
						VictoryState.STAR_1_POSITION.x, 
						VictoryState.STAR_1_POSITION.y,
						{ x: 0.9, y: 0.9 }
					);
					break;
				// Render the second star
				case VictoryState.STAR.SECOND:
					star.render(
						VictoryState.STAR_2_POSITION.x, 
						VictoryState.STAR_2_POSITION.y,
						{ x: 1.1, y: 1.1 }
					);
					break;
				// Render the third star
				case VictoryState.STAR.THIRD:
					star.render(
						VictoryState.STAR_3_POSITION.x, 
						VictoryState.STAR_3_POSITION.y,
						{ x: 0.9, y: 0.9 }
					);
					break;
			}
		})
	}
}
