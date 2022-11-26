import Panel from "../elements/Panel.js";
import Colour from "../../enums/Colour.js";
import { context } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import ProgressBar from "../elements/ProgressBar.js";

export default class BattleOpponentPanel extends Panel {
	/**
	 * The Panel displayed beside the opponent's Pokemon
	 * during battle that displays their name and health.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {Pokemon} pokemon
	 * @param {object} options Options for the super Panel.
	 */
	constructor(x, y, width, height, pokemon, options = {}) {
		super(x, y, width, height, options);

		this.pokemon = pokemon;
		
		this.progressBar = new ProgressBar(
			x + 1, 
			y + 1.25, 
			ProgressBar.WIDTH, 
			ProgressBar.HEIGHT, 
			true,
			Colour.Green
		);
	}

	render() {
		super.render();

		this.renderStatistics();
	}

	/**
	 * All the magic number offsets here are to
	 * arrange all the pieces nicely in the space.
	 */
	renderStatistics() {
		context.save();
		context.textBaseline = 'top';
		context.fillStyle = Colour.Black;
		context.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;
		context.fillText(this.pokemon.name.toUpperCase(), this.position.x + 15, this.position.y + 12);
		context.textAlign = 'right';
		// context.fillText(
		// 	`HP: ${this.pokemon.getHealthMeter()}`,
		// 	this.position.x + this.dimensions.x - 30,
		// 	this.position.y + this.dimensions.y - 25
		// );
		
		context.fillText(`Lv${this.pokemon.level}`, this.position.x + this.dimensions.x - 10, this.position.y + 12);

		this.progressBar.render();

		context.restore();
	}
}
