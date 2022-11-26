import { SoundName, StateName, Alignment } from "../enums.js";
import {
	context,
	keys,
	sounds,
	stateMachine,
	timer,
} from "../globals.js";
import { roundedRectangle } from "../../lib/DrawingHelpers.js";
import State from "../../lib/State.js";
import Board from "../objects/Board.js";
import Tile from "../objects/Tile.js";

export default class PlayState extends State {
	constructor() {
		super();

		// Position in the grid which we're currently highlighting.
		this.cursor = { boardX: 0, boardY: 0 };

		// Tile we're currently highlighting (preparing to swap).
		this.selectedTile = null;

		this.level = 1;
		this.hints = 3;

		this.hint = null;

		// Increases as the player makes matches.
		this.score = 0;

		// Score we have to reach to get to the next level.
		this.scoreGoal = 250;

		// How much score will be incremented by per match tile.
		this.baseScore = 10;

		// How much scoreGoal will be scaled by per level.
		this.scoreGoalScale = 1.25;

		/**
		 * The timer will countdown and the player must try and
		 * reach the scoreGoal before time runs out. The timer
		 * is reset when entering a new level.
		 */
		this.maxTimer = 60; //7
		this.minTimer = 0;
		this.NO_MATCHES = 0;
		this.TIMER_ADDITION_AMOUNT = 5;
		this.timer = this.maxTimer;
		this.INTERVAL_FOR_TIMER = 1;
	}

	enter(parameters) {
		this.board = parameters.board;
		this.score = parameters.score;
		this.level = parameters.level;
		this.scene = parameters.scene;
		this.hints = parameters.hints;
		this.timer = this.maxTimer;
		this.scoreGoal *= Math.floor(this.level * this.scoreGoalScale);

		this.startTimer();
	}

	exit() {
		timer.clear();
		sounds.pause(SoundName.Music3);
	}

	update(dt) {
		this.scene.update(dt);
		this.checkGameOver();
		this.checkVictory();
		this.updateCursor();

		// If we've pressed enter, select or deselect the currently highlighted tile.
		if (keys.Enter) {
			keys.Enter = false;

			this.selectTile();
		}

		// If we've pressed 'h', try to use hint
		if (keys.h){
			keys.h = false;

			// If no more hints, don't look for any
			if(this.hints === 0) return;

			// this.board.hintMatch = null;
			this.hints--;

			this.board.setRemovedHint(false);

			this.manageHint();
		}

		timer.update(dt);
	}

	async manageHint(){
		await this.board.checkForHintSwaps();

		// Get random index in hints array
		let randomHintsIndex = Math.floor(Math.random() * this.board.hints.length);
		// Set the hint to the hint at the random index
		this.hint = this.board.hints[randomHintsIndex];
	}

	render() {
		this.scene.render();
		this.board.render();

		if (this.selectedTile) this.renderSelectedTile();

		// If the hint is set, render the hint
		if (this.hint != null) 
			this.renderHint();

		this.renderCursor();
		this.renderUserInterface();
	}

	updateCursor() {
		let x = this.cursor.boardX;
		let y = this.cursor.boardY;

		if (keys.w) {
			keys.w = false;
			y = Math.max(0, y - 1);
			sounds.play(SoundName.Select);
		}
		else if (keys.s) {
			keys.s = false;
			y = Math.min(Board.SIZE - 1, y + 1);
			sounds.play(SoundName.Select);
		}
		else if (keys.a) {
			keys.a = false;
			x = Math.max(0, x - 1);
			sounds.play(SoundName.Select);
		}
		else if (keys.d) {
			keys.d = false;
			x = Math.min(Board.SIZE - 1, x + 1);
			sounds.play(SoundName.Select);
		}

		this.cursor.boardX = x;
		this.cursor.boardY = y;
	}

	selectTile() {
		const highlightedTile = this.board.tiles[this.cursor.boardY][this.cursor.boardX];

		/**
		 * The `?.` syntax is called "optional chaining" which allows you to check
		 * a property on an object even if that object is `null` at the time.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
		 */
		const tileDistance = Math.abs(this.selectedTile?.boardX - highlightedTile.boardX) + Math.abs(this.selectedTile?.boardY - highlightedTile.boardY);

		// If nothing is selected, select current tile.
		if (!this.selectedTile) {
			this.selectedTile = highlightedTile;
		}
		// Remove highlight if already selected.
		else if (this.selectedTile === highlightedTile) {
			this.selectedTile = null;
		}
		/**
		 * If the difference between X and Y combined of this selected
		 * tile vs the previous is not equal to 1, also remove highlight.
		 */
		else if (tileDistance > 1) {
			sounds.play(SoundName.Error);
			this.selectedTile = null;
		}
		// Otherwise, do the swap, and check for matches.
		else {
			this.swapTiles(highlightedTile);
		}
	}

	async swapTiles(highlightedTile) {
		await this.board.swapTiles(this.selectedTile, highlightedTile);

		await this.clearHint();
		
		// If there was a match after a swap, swap the tiles back 
		if (await this.board.matchAfterSwap()){
			sounds.play(SoundName.Error);
			await this.board.swapTiles(highlightedTile, this.selectedTile);
		}

		this.selectedTile = null;
		await this.calculateMatches(highlightedTile);
	}

	/**
	 * Clears the hint.
	 */
	async clearHint(){
		if (this.board.getIfRemovedHint()) {
			this.board.setRemovedHint(false);
			this.hint = null;
		}
	}

	renderHint(){
		context.save();
		context.strokeStyle = 'red';
		context.lineWidth = 4;

		// Use board position * Tile.SIZE so that the cursor doesn't get tweened during a swap.
		roundedRectangle(
			context,
			this.hint.tile1.x < this.hint.tile2.x
				? this.hint.tile1.x + this.board.x
				: this.hint.tile2.x + this.board.x,
			this.hint.tile1.y < this.hint.tile2.y
				? this.hint.tile1.y + this.board.y
				: this.hint.tile2.y + this.board.y,
			// this.hint.tile1.y + this.board.y,
			this.hint.alignment === Alignment.Horizontal 
				? Tile.SIZE * 2 
				: Tile.SIZE,
			this.hint.alignment === Alignment.Vertical 
				? Tile.SIZE * 2 
				: Tile.SIZE
		);

		context.restore();
	}

	renderSelectedTile() {
		context.save();
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';
		roundedRectangle(
			context,
			this.selectedTile.x + this.board.x,
			this.selectedTile.y + this.board.y,
			Tile.SIZE,
			Tile.SIZE,
			10,
			true,
		);
		context.restore();
	}

	renderCursor() {
		context.save();
		context.strokeStyle = 'white';
		context.lineWidth = 4;

		// Use board position * Tile.SIZE so that the cursor doesn't get tweened during a swap.
		roundedRectangle(
			context,
			this.cursor.boardX * Tile.SIZE + this.board.x,
			this.cursor.boardY * Tile.SIZE + this.board.y,
			Tile.SIZE,
			Tile.SIZE
		);
		context.restore();
	}

	renderUserInterface() {
		context.fillStyle = 'rgb(56, 56, 56, 0.9)';
		roundedRectangle(
			context,
			50,
			this.board.y,
			225,
			Board.SIZE * Tile.SIZE,
			5,
			true,
			false,
		);

		context.fillStyle = 'white';
		context.font = '25px Joystix';

		context.textAlign = 'left';
		context.fillText(`Level:`, 70, this.board.y + 30);
		context.fillText(`Score:`, 70, this.board.y + 80);
		context.fillText(`Goal:`, 70, this.board.y + 130);
		context.fillText(`Hints:`, 70, this.board.y + 180);
		context.fillText(`Timer:`, 70, this.board.y + 230);

		context.textAlign = 'right';
		context.fillText(`${this.level}`, 250, this.board.y + 30);
		context.fillText(`${this.score}`, 250, this.board.y + 80);
		context.fillText(`${this.scoreGoal}`, 250, this.board.y + 130);
		context.fillText(`${this.hints}`, 250, this.board.y + 180);
		context.fillText(`${this.timer}`, 250, this.board.y + 230);
	}

	/**
	 * Calculates whether any matches were found on the board and tweens the needed
	 * tiles to their new destinations if so. Also removes tiles from the board that
	 * have matched and replaces them with new randomized tiles, deferring most of this
	 * to the Board class.
	 */
	async calculateMatches(highlightedTile) {
		// Get all matches for the current board.
		this.board.calculateMatches();

		let getNumberOfMatches = this.board.getNumberOfMatches();

		// If no matches, no need to calculate
		if (getNumberOfMatches === 0) return;

		// Increase the timer if there are matches
		if (getNumberOfMatches > this.NO_MATCHES){
			// Increase the timer by the timer addition amount for each match
			this.timer += (getNumberOfMatches * this.TIMER_ADDITION_AMOUNT);

			// Loop over the tasks to find the correct timer task
			for (let i = 0; i < timer.tasks.length; i++) {
				let getCurrentTask = timer.tasks[i];

				// Check for the timer task that subtracts the timer every second
				if (getCurrentTask.interval === this.INTERVAL_FOR_TIMER){
					// Remove the timer task, since we want to reset the duration to the new timer
					timer.tasks.splice(i, 1);

					// Add the new timer task with the new duration
					timer.addTask(() => {
						this.timer--;
			
						if (this.timer <= 5) {
							sounds.play(SoundName.Clock);
						}
					}, this.INTERVAL_FOR_TIMER, this.timer, () => this.moveToGameOver()
					);

					break;
				}
			}			
		}

		this.calculateScore();

		// Remove any matches from the board to create empty spaces.
		this.board.removeMatches();

		await this.placeNewTiles();

		/**
		 * Recursively call function in case new matches have been created
		 * as a result of falling blocks once new blocks have finished falling.
		 */
		await this.calculateMatches(highlightedTile);
	}
	
	calculateScore() {
		this.board.matches.forEach((match) => {
			for (let i = 0; i < match.length; i++) {
				this.score += match[i].pointsWorth;
			}
		});
	}

	async placeNewTiles() {
		// Get an array with tween values for tiles that should now fall as a result of the removal.
		const tilesToFall = this.board.getFallingTiles();

		// Tween all the falling blocks simultaneously.
		await Promise.all(tilesToFall.map((tile) => {
			timer.tweenAsync(tile.tile, tile.parameters, tile.endValues, 0.25);
		}));

		// Get an array with tween values for tiles that should replace the removed tiles.
		const newTiles = this.board.getNewTiles(this.level);

		// Tween the new tiles falling one by one for a more interesting animation.
		for (const tile of newTiles) {
			await timer.tweenAsync(tile.tile, tile.parameters, tile.endValues, 0.05);
		}
	}

	startTimer() {
		// Decrement the timer every second.
		timer.addTask(() => {
			this.timer--;

			if (this.timer <= 5) {
				sounds.play(SoundName.Clock);
			}
		}, this.INTERVAL_FOR_TIMER, this.maxTimer, () => this.moveToGameOver()
		);
	}

	checkVictory() {
		if (this.score < this.scoreGoal) {
			return;
		}

		sounds.play(SoundName.NextLevel);

		stateMachine.change(StateName.LevelTransition, {
			level: this.level + 1,
			score: this.score,
			scene: this.scene,
		});
	}

	checkGameOver() {
		if (this.timer > 0) {
			return;
		}

		this.moveToGameOver();
	}

	moveToGameOver(){
		sounds.play(SoundName.GameOver);

		stateMachine.change(StateName.GameOver, {
			score: this.score,
			scene: this.scene,
		});
	}
}
