import State from "../../../lib/State.js";
import { stateStack } from "../../globals.js";
import Menu from "../../user-interface/elements/Menu.js";
import BattleMessageState from "./BattleMessageState.js";
import BattleState from "./BattleState.js";
import BattleTurnState from "./BattleTurnState.js";

export default class BattleMenuState extends State {
	static MENU_OPTIONS = {
		Fight: "FIGHT",
		Status: "STATUS",
		Run: "RUN"
	}

	/**
	 * Represents the menu during the battle that the Player can choose an action from.
	 *
	 * @param {BattleState} battleState
	 */
	constructor(battleState) {
		super();

		this.battleState = battleState;

		const items = [
			{ text: BattleMenuState.MENU_OPTIONS.Fight, onSelect: () => this.fight() },
			// { text: BattleMenuState.MENU_OPTIONS.Status, onSelect: () => this.status() },
			{ text: BattleMenuState.MENU_OPTIONS.Run, onSelect: () => this.run() },
		];

		this.battleMenu = new Menu(
			Menu.BATTLE_MENU.x,
			Menu.BATTLE_MENU.y,
			Menu.BATTLE_MENU.width,
			Menu.BATTLE_MENU.height,
			items,
		);
	}

	update() {
		this.battleMenu.update();
		this.battleState.update();
	}

	render() {
		this.battleMenu.render();
	}

	fight() {
		stateStack.pop();
		stateStack.push(new BattleTurnState(this.battleState));
	}

	status() {
		stateStack.push(new BattleMessageState(`You're doing great!`, 2));
	}
	
	run() {
		stateStack.push(new BattleMessageState(`${this.battleState.playerPokemon.name} got away safely!`, 1.25, () => {
			// Loop over the states
			while (true) {
				// Peek at the top state
				let topState = stateStack.top();

				// If the top state is the current battle state, break to transition to the play state
				if (topState instanceof BattleState)
					break;

				// Pop the top state from the state stack until we get to the battle state
				stateStack.pop();
			}

			// Exit the battle if the top state is the current battle state
			this.battleState.exitBattle();
		}));
	}
}
