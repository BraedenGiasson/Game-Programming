import State from "../../../lib/State.js";
import { stateStack } from "../../globals.js";
import Panel from "../../user-interface/elements/Panel.js";
import Textbox from "../../user-interface/elements/Textbox.js";

export default class BattleStatsMenuState extends State {
	/**
	 * Any text to display to the Player during battle
	 * is shown in this state.
	 *
	 * @param {object} originalStats The pokemon's stats before leveling up.
	 * @param {object} newStats The pokemon's stats after leveling up.
	 * @param {number} waitDuration How long to wait before auto-closing the textbox.
	 * @param {function} onClose
	 */
	 constructor(originalStats, newStats, waitDuration = 0, onClose = () => { }) {
		super();

		this.originalStats = originalStats;
		this.newStats = newStats;

		let message = this.constructMessage();

		this.textbox = new Textbox(
			Panel.POKEMON_STATS.x,
			Panel.POKEMON_STATS.y,
			Panel.POKEMON_STATS.width,
			Panel.POKEMON_STATS.height,
			message,
			{ isAdvanceable: waitDuration === 0 }
		);
		this.waitDuration = waitDuration;
		this.onClose = onClose;

		if (waitDuration > 0) {
			timer.wait(this.waitDuration, () => {
				stateStack.pop();
				onClose();
			});
		}
	}

	/**
	 * Constructs the pokemon's stats message.
	 * @returns The string representing the stats message in the panel.
	 */
	constructMessage(){
		return `New Stats :\n
				Health: ${this.originalStats.health} > ${this.newStats.newHealth}
				Attack: ${this.originalStats.attack} > ${this.newStats.newAttack}
				Defense: ${this.originalStats.defense} > ${this.newStats.newDefense}
				Speed: ${this.originalStats.speed} > ${this.newStats.newSpeed}`;
	}

	update() {
		if (this.waitDuration === 0) {
			this.textbox.update();

			if (this.textbox.isClosed) {
				stateStack.pop();
				this.onClose();
			}
		}
	}

	render() {
		this.textbox.render();
	}
}
