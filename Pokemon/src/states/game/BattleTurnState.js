import State from "../../../lib/State.js";
import SoundName from "../../enums/SoundName.js";
import { CANVAS_HEIGHT, sounds, stateStack, timer } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import BattleMenuState from "./BattleMenuState.js";
import BattleMessageState from "./BattleMessageState.js";
import BattleState from "./BattleState.js";
import { oneInXChance } from "../../../lib/RandomNumberHelpers.js";
import BattleStatsMenuState from "./BattleStatsMenuState.js";
import Colour from "../../enums/Colour.js";
import ProgressBar from "../../user-interface/elements/ProgressBar.js";
import Tile from "../../services/Tile.js";

export default class BattleTurnState extends State {
	/**
	 * When Pokemon attack each other, this state takes
	 * care of lowering their health and reflecting the
	 * changes in the UI. If the Player is victorious,
	 * the Pokemon is awarded with experience based on the
	 * opponent Pokemon's stats.
	 *
	 * @param {BattleState} battleState
	 */
	constructor(battleState) {
		super();

		this.battleState = battleState;
		this.playerPokemon = battleState.playerPokemon;
		this.opponentPokemon = battleState.opponentPokemon;

		// Determine the order of attack based on the Pokemons' speed.
		if (this.playerPokemon.speed > this.opponentPokemon.speed) {
			this.firstPokemon = this.playerPokemon;
			this.secondPokemon = this.opponentPokemon;
		}
		else if (this.playerPokemon.speed < this.opponentPokemon.speed) {
			this.firstPokemon = this.opponentPokemon;
			this.secondPokemon = this.playerPokemon;
		}
		else if (oneInXChance(2)) {
			this.firstPokemon = this.playerPokemon;
			this.secondPokemon = this.opponentPokemon;
		}
		else {
			this.firstPokemon = this.opponentPokemon;
			this.secondPokemon = this.playerPokemon;
		}
	}

	enter() {
		this.attack(this.firstPokemon, this.secondPokemon, () => {
			if (this.checkBattleEnded()) {
				stateStack.pop();
				return;
			}

			this.attack(this.secondPokemon, this.firstPokemon, () => {
				if (this.checkBattleEnded()) {
					stateStack.pop();
					return;
				}

				stateStack.pop();
				stateStack.push(new BattleMenuState(this.battleState));
			});
		});
	}

	update() {
		this.battleState.update();
	}

	/**
	 * Animate the attacking Pokemon and deal damage to the defending Pokemon.
	 * Move the attacker forward and back quickly to indicate an attack motion.
	 *
	 * @param {Pokemon} attacker
	 * @param {Pokemon} defender
	 * @param {function} callback
	 */
	attack(attacker, defender, callback) {
		stateStack.push(new BattleMessageState(`${attacker.name} attacked ${defender.name}!`, 0.5, () => {
			timer.tween(
				attacker.position,
				['x', 'y'],
				[attacker.attackPosition.x, attacker.attackPosition.y],
				0.1,
				() => {
					timer.tween(
						attacker.position,
						['x', 'y'],
						[attacker.battlePosition.x, attacker.battlePosition.y],
						0.1,
						() => this.inflictDamage(attacker, defender, callback));
				});
		}));
	}

	/**
	 * Flash the defender to indicate they were attacked.
	 * When finished, decrease the defender's health bar.
	 */
	inflictDamage(attacker, defender, callback) {
		sounds.play(SoundName.BattleDamage);

		const action = () => {
			defender.alpha = defender.alpha === 1 ? 0.5 : 1;
		};
		const interval = 0.05;
		const duration = 0.5;

		timer.addTask(action, interval, duration, () => {
			defender.alpha = 1;

			let startingHealth = defender.currentHealth;

			attacker.inflictDamage(defender);

			// Get the panel of the defender
			let panel = defender === this.playerPokemon
					  ? this.battleState.playerPanel
					  : this.battleState.opponentPanel;

			// Get the width of the progress bar
			let endOfProgressBar = defender.dimensions.x;
			// Get the health percentage 
			let healthPercentage = defender.currentHealth / defender.initialHealth;
			// Get the pixel amount for the current health
			let pixelAmountForProgressBar = (healthPercentage * ProgressBar.WIDTH) * Tile.SIZE;
			// Get the difference for the progression of the progress bar
			let difference = endOfProgressBar - pixelAmountForProgressBar;
			// Calculate the final tween position of the progress bar
			let tweenFinalPosition = endOfProgressBar - difference;

			// Set to render the edge rounded rectangle
			if (!panel.progressBar.progressBarDonePosition
				&& (startingHealth === defender.initialHealth)){
				panel.progressBar.progressBarDonePosition = false;
			}

			// Tween the progress bar for the panel
			timer.tween(
				panel.progressBar.initialValue,
				['x'],
				[tweenFinalPosition], 
				0.75, 
				() => {
					// Don't render the progress bar if health goes below 0
					if (defender.currentHealth <= 0) {
						panel.progressBar.canRender = false;
					}
				}
			);

			callback();
		});
	}

	checkBattleEnded() {
		if (this.playerPokemon.currentHealth <= 0) {
			this.processDefeat();
			return true;
		}
		else if (this.opponentPokemon.currentHealth <= 0) {
			this.processVictory();
			return true;
		}

		return false;
	}

	/**
	 * Tween the Player Pokemon off the bottom of the screen.
	 * Fade out and transition back to the PlayState.
	 */
	processDefeat() {
		sounds.play(SoundName.PokemonFaint);
		timer.tween(this.playerPokemon.position, ['y'], [CANVAS_HEIGHT], 0.2, () => {
			stateStack.push(new BattleMessageState(`${this.playerPokemon.name} fainted!`, 0, () => this.battleState.exitBattle()));
		});
	}

	/**
	 * Tween the Opponent Pokemon off the bottom of the screen.
	 * Process experience gained by the Player Pokemon.
	 */
	processVictory() {
		sounds.play(SoundName.PokemonFaint);
		timer.tween(this.opponentPokemon.position, ['y'], [CANVAS_HEIGHT], 0.4, () => {
			sounds.stop(SoundName.BattleLoop);
			sounds.play(SoundName.BattleVictory);
			stateStack.push(new BattleMessageState('You won!', 0, () => this.processExperience()));
		});
	}

	processExperience() {
		const experience = this.playerPokemon.calculateExperienceToAward(this.opponentPokemon);
		const message = `${this.playerPokemon.name} earned ${experience} experience points!`;

		stateStack.push(new BattleMessageState(message, 1.5, () => {
			this.battleState.playerExperienceBar.canRender = true;

			// Get the target experience for the level
			let targetExperience = this.battleState.opponentPokemon.targetExperience;

			// The pixel amount for each block to increase progress bar by
		    let pixelAmountForIndividualExperience = 
				this.battleState.playerExperienceBar.endValues.x
				/ targetExperience;
			
			// Set initial experience left
			let experienceLeft = targetExperience;

			// Calculate the final position of the tweened progress bar
			let finalPosition = this.battleState.playerExperienceBar.initialValue.x
					+ (pixelAmountForIndividualExperience * experienceLeft);

			// Set initial currentExperienceCounter
			let currentExperienceCounter = experienceLeft;

			// Recursive calls to tween all the experience
			this.tweenProgressBar(
				experience, 
				targetExperience, 
				currentExperienceCounter, 
				experienceLeft, 
				finalPosition, 
				pixelAmountForIndividualExperience);

			// Wait to give player time to see the experience they gained
			timer.wait(1.5, () => this.processLevelUp(experience));
		}));
	}

	/**
	 * Recursive method to tween the progress bar multiple times by how much experience to award.
	 * @param {*} experience The experience to award.
	 * @param {*} targetExperience The target experience for the level.
	 * @param {*} currentExperienceCounter The current experience displayed.
	 * @param {*} experienceLeft The current experience left to display.
	 * @param {*} finalPosition The final position of the tweened progress bar.
	 * @param {*} pixelAmountForIndividualExperience The pixel amount for each block to increase progress bar by.
	 * @returns Recursive call until all experience has been shown.
	 */
	tweenProgressBar(
		experience, 
		targetExperience, 
		currentExperienceCounter, 
		experienceLeft, 
		finalPosition, 
		pixelAmountForIndividualExperience)
	{
		// If we displayed already how much experience was gained, no need to continue
		if (currentExperienceCounter > experience) return;

		timer.tween(
			this.battleState.playerExperienceBar.initialValue,
			['x'],
			[finalPosition], 
			0.75, 
			() => {
				// Get the current experience left
				experienceLeft = Math.abs(experience - targetExperience);

				// Track how much experience has been used in the progress bar
				currentExperienceCounter += experienceLeft;

				// If we displayed already how much experience was gained, no need to continue
				if (currentExperienceCounter > experience) return;

				// Reset starting point of progress bar to beggining
				this.battleState.playerExperienceBar.initialValue.x = 0;

				// Calculate the final position of the tweened progress bar
				finalPosition = this.battleState.playerExperienceBar.initialValue.x
					+ (pixelAmountForIndividualExperience * experienceLeft);

				// Recursive call to tween progress bar from start again
				this.tweenProgressBar(
					experience, 
					targetExperience, 
					currentExperienceCounter, 
					experienceLeft, 
					finalPosition, 
					pixelAmountForIndividualExperience);
			}
		);
	}

	processLevelUp(experience) {
		this.playerPokemon.currentExperience += experience;

		// Level up if we've gone over the experience threshold.
		if (this.playerPokemon.currentExperience < this.playerPokemon.targetExperience) {
			this.battleState.exitBattle();
			return;
		}

		sounds.play(SoundName.ExperienceFull);

		// Stores the player's stats before leveling up
		let originalStats = {
			health: this.playerPokemon.health,
			attack: this.playerPokemon.attack,
			defense: this.playerPokemon.defense,
			speed: this.playerPokemon.speed
		};
		
		// Stores the new player's stats for the stat menu
		let newStats = this.playerPokemon.levelUp();

		stateStack.push(new BattleMessageState(`${this.playerPokemon.name} grew to LV. ${this.playerPokemon.level}!`, 1.5, () => {
			// Exit the battle
			stateStack.push(new BattleStatsMenuState(originalStats, newStats, 0, () => this.battleState.exitBattle()));
		}));
	}
}
