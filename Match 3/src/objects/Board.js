import {
	sounds,
	timer,
	CANVAS_WIDTH,
	CANVAS_HEIGHT
} from '../globals.js';
import Tile from './Tile.js';
import { SoundName, TileColour, TilePattern, Alignment } from '../enums.js';
import { getRandomNumber, getRandomPositiveInteger, pickRandomElement } from '../../lib/RandomNumberHelpers.js';

export default class Board {
	static SIZE = 8;
	static POSITION_CENTER = {
		x: (CANVAS_WIDTH - (Board.SIZE * Tile.SIZE)) / 2,
		y: (CANVAS_HEIGHT - (Board.SIZE * Tile.SIZE)) / 2,
	};
	static POSITION_RIGHT = {
		x: (CANVAS_WIDTH - (Board.SIZE * Tile.SIZE)) * 0.85,
		y: (CANVAS_HEIGHT - (Board.SIZE * Tile.SIZE)) / 2,
	};

	/**
	 * The Board is our arrangement of Tiles with which we must try
	 * to find matching sets of three horizontally or vertically.
	 *
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(x, y, width = Board.SIZE, height = Board.SIZE) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.matches = [];
		this.tiles = [];
		this.minimumMatchLength = 3;
		this.tileSprites = Tile.generateSprites();
		this.MAX_TILE = 6;
		this.BASE_POINTS = 10;
		this.numberOfStarsToSpawn = 1;
		this.starsLocation = [];
		this.PATTERN_NOT_SET = -1;
		this.numberOfSpaceTiles = 0;
		this.numberOfCurrentStarsOnBoard = 0;
		this.locationsOfSpaces = [];
		this.hints = [];
		this.hintAlignment = Alignment.Horizontal;
		this.removedHint = false;
	}

	getNumberOfMatches(){
		return this.matches.length;
	}

	render() {
		this.renderBoard();
	}

	// Loops through the tiles and renders them at their location.
	renderBoard() {
		for (let row = 0; row < this.height; row++) {
			for (let column = 0; column < this.width; column++) {
				this.tiles[row][column].render(this.x, this.y);
			}
		}
	}

	initializePlayBoard(level) {
		// Get random number of stars to spawn
		this.numberOfStarsToSpawn = Math.floor((level + 2) / level);
		this.numberOfCurrentStarsOnBoard = this.numberOfStarsToSpawn;

		// Reinitialize if matches exist so we always start with a matchless board.
		do {
			this.spawnStarTiles();

			this.initializeBoard(level);
			this.calculateMatches();
		}
		while (this.matches.length > 0);
	}

	/**
	 * Spawn a star tile at a random location.
	 */
	spawnStarTiles(){
		// Spawn star tile at random location for each star tile
		for (let i = 0; i < this.numberOfStarsToSpawn; i++) {
			let x = getRandomPositiveInteger(0, Board.SIZE - 1);
			let y = getRandomPositiveInteger(0, Board.SIZE - 1);

			this.starsLocation.push(
				{x: x,
				 y: y}
			);
		}
	}

	initializeTitleScreenBoard() {
		this.initializeBoard(0, true);
	}

	initializeBoard(level = 0, isTitleScreenBoard = false) {
		this.tiles = [];

		// For each row in the board...
		for (let row = 0; row < this.height; row++) {
			// Insert a new array to represent the row.
			this.tiles.push([]);

			// For each column in the row...
			for (let column = 0; column < this.width; column++) {
				// If the board is the regular game board
				if (isTitleScreenBoard === false)
					this.tiles[row].push(this.generateTile(column, row, level, false));
				// If the board is for the title screen board
				else
					this.tiles[row].push(this.generateTile(column, row, level, true));
			}
		}
	}

	generateTile(x, y, level, isForTitleScreen = false, thePattern = null) {
		const colourList = [
			TileColour.Beige,
			TileColour.Pink,
			TileColour.Purple,
			TileColour.LightGreen,
			TileColour.Blue,
			TileColour.Orange,
		];

		let pattern = thePattern ?? this.PATTERN_NOT_SET;

		// Set the pattern to the flat if it's the title screen 
		if (isForTitleScreen === true){
			pattern = TilePattern.Flat;
		}
		else{
			// Loop over the star locations to determine if should spawn star tile
			for (let i = 0; i < this.starsLocation.length; i++) {
				// Get the current star location
				let currentStar = this.starsLocation[i];

				// If the locations match, spawn star tile and remove from stars array
				if(currentStar.x === x && currentStar.y === y){
					pattern = TilePattern.Star;
					this.starsLocation.splice(i, 1);
				}
			}

			// If the pattern still hasn't been set
			if(pattern === this.PATTERN_NOT_SET){
				// Any tile from flat to triangle
				let levelTile = level >= this.MAX_TILE
				? 4
				: level - 1;

				const patternRange = [0, levelTile];
				pattern = getRandomPositiveInteger(patternRange[0], patternRange[1]);
			}
		}

		// Set the pattern if the pattern is not null
		if(thePattern != null) pattern = thePattern;

		const colour = pickRandomElement(colourList);
		// Calculate the points amount of the current tile
		const points = this.BASE_POINTS * (pattern + 1);

		return new Tile(x, y, points, colour, pattern, this.tileSprites);
	}

	getIfRemovedHint(){
		return this.removedHint;
	}

	/**
	 * Sets the value of the removed hint.
	 * @param {*} value True if the value should be true, otherwise false.
	 */
	setRemovedHint(value){
		this.removedHint = value;
	}

	/**
	 * Loops over the hints array to check to remove hint if hint is active.
	 * @param {*} selectedTile 
	 * @param {*} highlightedTile 
	 * @returns 
	 */
	async checkToRemoveHint(selectedTile, highlightedTile){
		for (let i = 0; i < this.hints.length; i++) {
			let currentHint = this.hints[i];

			// If the first tiles match
			let match1 = ((selectedTile === currentHint.tile1)
							&& (highlightedTile === currentHint.tile2));

			// If the second tiles match
			let match2 = ((selectedTile === currentHint.tile2)
							&& (highlightedTile === currentHint.tile1));

			// Check if there was a match, and remove from hints array
			if (match1 || match2){
				this.hints.splice(i, 1);
				this.removedHint = true;
				return;
			}
		}
	}

	async swapTiles(selectedTile, highlightedTile) {
		await this.checkToRemoveHint(selectedTile, highlightedTile);

		const temporaryTile = new Tile(
								selectedTile.boardX, 
								selectedTile.boardY
							);

		// Swap canvas positions by tweening so the swap is animated.
		timer.tweenAsync(highlightedTile, ['x', 'y'], [temporaryTile.x, temporaryTile.y], 0.2);
		await timer.tweenAsync(selectedTile, ['x', 'y'], [highlightedTile.x, highlightedTile.y], 0.2);

		// Swap board positions.
		selectedTile.boardX = highlightedTile.boardX;
		selectedTile.boardY = highlightedTile.boardY;
		highlightedTile.boardX = temporaryTile.boardX;
		highlightedTile.boardY = temporaryTile.boardY;

		// Swap tiles in the tiles array.
		this.tiles[selectedTile.boardY][selectedTile.boardX] = selectedTile;
		this.tiles[highlightedTile.boardY][highlightedTile.boardX] = highlightedTile;
	}

	/**
	 * Checks if there were any matches after a swap.
	 * @returns True if there was at least 1 match after the swap; otherwise false.
	 */
	async matchAfterSwap(){
		this.calculateMatches();
		return this.getNumberOfMatches() === 0;
	} 

	/**
	 * Goes left to right, top to bottom in the board, calculating matches by
	 * counting consecutive tiles of the same color. Doesn't need to check the
	 * last tile in every row or column if the last two haven't been a match.
	 */
	calculateMatches() {
		this.matches = [];
		this.resolveHorizontalMatches();
		this.resolveVerticalMatches();
	}

	resolveHorizontalMatches() {
		for (let y = 0; y < Board.SIZE; y++) {
			let matchCounter = 1;
			let colourToMatch = this.tiles[y][0].colour;
			let rowMatches = [];
			let includesStarTile = false;
			const secondIndex = 1;

			// For every horizontal tile...
			for (let x = secondIndex; x < Board.SIZE; x++) {
				// If this is the same colour as the one we're trying to match...
				if (this.tiles[y][x].colour === colourToMatch) {
					matchCounter++;

					// If the y is the second index, check the first tile of the row if it's a star tile
					if(x === secondIndex){
						// If the tile is a star
						if (this.tiles[y][x - 1].pattern === TilePattern.Star)
							includesStarTile = true;
					}
					else{
						// If the tile is a star
						if (this.tiles[y][x].pattern === TilePattern.Star)
							includesStarTile = true;
					}
				}
				else {
					// Set this as the new colour we want to watch for.
					colourToMatch = this.tiles[y][x].colour;

					// If we have a match of 3 or more up until now, add it to our matches array.
					if (matchCounter >= this.minimumMatchLength) {
						let match = [];

						// If the match includes a star tile, match is the entire row
						if (includesStarTile){
							// Go over the entire current row
							for (let x3 = Board.SIZE - 1; x3 >= 0; x3--) 
								match.push(this.tiles[y][x3]);

							includesStarTile = false;
						}
						else{
							// Go backwards from here by matchCounter.
							for (let x2 = x - 1; x2 >= x - matchCounter; x2--) 
								// Add each tile to the match that's in that match.
								match.push(this.tiles[y][x2]);
						}

						// Add this match to our total matches array.
						rowMatches.push(match);
					}

					matchCounter = 1;
					includesStarTile = false;

					// We don't need to check last two if they won't be in a match.
					if (x >= Board.SIZE - 2) {
						break;
					}
				}
			}

			// Account for matches at the end of a row.
			if (matchCounter >= this.minimumMatchLength) {
				let match = [];

				// If the match includes a star tile, match is the entire row
				if (includesStarTile){
					// Go over the entire current row
					for (let x3 = Board.SIZE - 1; x3 >= 0; x3--) 
						match.push(this.tiles[y][x3]);
				}
				else{
					// Go backwards from here by matchCounter.
					for (let x2 = Board.SIZE - 1; x2 >= Board.SIZE - matchCounter; x2--) 
						// Add each tile to the match that's in that match.
						match.push(this.tiles[y][x2]);
				}

				// Add this match to our total matches array.
				rowMatches.push(match);
			}

			// Insert matches into the board matches array.
			rowMatches.forEach(match => this.matches.push(match));
		}
	}

	resolveVerticalMatches() {
		for (let x = 0; x < Board.SIZE; x++) {
			let matchCounter = 1;
			let colourToMatch = this.tiles[0][x].colour;
			let columnMatches = [];
			let includesStarTile = false;
			const secondIndex = 1;

			// For every vertical tile...
			for (let y = secondIndex; y < Board.SIZE; y++) {
				// If this is the same colour as the one we're trying to match...
				if (this.tiles[y][x].colour === colourToMatch) {
					matchCounter++;

					// If the y is the second index, check the first tile of the column if it's a star tile
					if(y === secondIndex){
						// If the tile is a star
						if (this.tiles[y - 1][x].pattern === TilePattern.Star)
							includesStarTile = true;
					}
					else{
						// If the tile is a star
						if (this.tiles[y][x].pattern === TilePattern.Star)
							includesStarTile = true;
					}
				}
				else {
					// Set this as the new colour we want to watch for.
					colourToMatch = this.tiles[y][x].colour;

					// If we have a match of 3 or more up until now, add it to our matches array.
					if (matchCounter >= this.minimumMatchLength) {
						let match = [];

						// If the match includes a star tile, match is the entire column
						if (includesStarTile){
							// Go over the entire current column
							for (let y3 = Board.SIZE - 1; y3 >= 0; y3--) 
								match.push(this.tiles[y3][x]);
							
							includesStarTile = false;
						}
						else{
							// Go backwards from here by matchCounter.
							for (let y2 = y - 1; y2 >= y - matchCounter; y2--) 
								// Add each tile to the match that's in that match.
								match.push(this.tiles[y2][x]);
						}

						// Add this match to our total matches array.
						columnMatches.push(match);
					}

					matchCounter = 1;
					includesStarTile = false;

					// We don't need to check last two if they won't be in a match.
					if (y >= Board.SIZE - 2) {
						break;
					}
				}
			}

			// Account for matches at the end of a column.
			if (matchCounter >= this.minimumMatchLength) {
				let match = [];

				// If the match includes a star tile, match is the entire column
				if (includesStarTile){
					// Go over the entire current column
					for (let y3 = Board.SIZE - 1; y3 >= 0; y3--) 
						match.push(this.tiles[y3][x]);
				}
				else{
					// Go backwards from here by matchCounter.
					for (let y2 = Board.SIZE - 1; y2 >= Board.SIZE - matchCounter; y2--) 
						// Add each tile to the match that's in that match.
						match.push(this.tiles[y2][x]);
				}

				// Add this match to our total matches array.
				columnMatches.push(match);
			}

			// Insert matches into the board matches array.
			columnMatches.forEach(match => this.matches.push(match));
		}
	}

	/**
	 * Remove the matches from the Board by setting the Tile slots
	 * within them to null, then setting this.matches to empty.
	 */
	removeMatches() {
		if (this.matches.length === 0) {
			return;
		}

		this.matches.forEach((match) => {
			match.forEach((tile) => {
				// Remove 1 from the number of stars on board if the tile is a star
				if(tile.pattern === TilePattern.Star) 
					this.numberOfCurrentStarsOnBoard--;

				this.tiles[tile.boardY][tile.boardX] = null;
			});

			sounds.play(SoundName.Match);
		});

		this.matches = [];
	}

	/**
	 * Shifts down all of the tiles that now have spaces below them, then returns
	 * an array that contains tweening information for these new tiles.
	 *
	 * @returns An array containing all the tween definitions for the falling tiles.
	 */
	getFallingTiles() {
		// An array to hold the tween definitions.
		const tweens = [];

		// For each column, go up tile by tile till we hit a space.
		for (let column = 0; column < Board.SIZE; column++) {
			let space = false;
			let spaceRow = 0;
			let row = Board.SIZE - 1;

			while (row >= 0) {
				// If our last tile was a space...
				const tile = this.tiles[row][column];

				// If the current tile is *not* a space, bring this down to the lowest space.
				if (space && tile) {
					// Put the tile in the correct spot in the board and fix its grid position.
					this.tiles[spaceRow][column] = tile;
					tile.boardY = spaceRow;

					// Set its prior position to null.
					this.tiles[row][column] = null;

					// Add a tween definition to be processed later.
					tweens.push({
						tile,
						parameters: ['y'],
						endValues: [tile.boardY * Tile.SIZE],
					});

					// Reset parameters so we start back from here in the next iteration.
					space = false;
					row = spaceRow;
					spaceRow = 0;
				}
				// If the current tile is a space, mark it as such.
				else if (tile === null) {
					space = true;

					if (spaceRow === 0) {
						spaceRow = row;
					}
				}

				row--;
			}
		}

		return tweens;
	}

	/**
	 * Scans the board for empty spaces and generates new tiles for each space.
	 *
	 * @returns An array containing all the tween definitions for the new tiles.
	 */
	getNewTiles(level) {
		const tweens = [];

		// Create replacement tiles at the top of the screen.
		for (let x = 0; x < Board.SIZE; x++) {
			for (let y = Board.SIZE - 1; y >= 0; y--) {
				// If the tile is exists, move on to the next one.
				if (this.tiles[y][x]) {
					continue;
				}

				// If the tile doesn't exist, that means it's a space that needs a new tile.
				const tile = this.generateTile(x, y, level);

				tile.y = -Tile.SIZE;
				this.tiles[y][x] = tile;

				// Adds the location of the current space
				this.locationsOfSpaces.push({
					x: tile.boardX,
					y: tile.boardY
				});
				this.numberOfSpaceTiles++;

				// Add a tween definition to be processed later.
				tweens.push({
					tile,
					parameters: ['y'],
					endValues: [tile.boardY * Tile.SIZE],
				});
			}
		}

		// Keeps track of the number of new star tiles to place
		let numberOfMoreStarsToSpawn = this.numberOfStarsToSpawn - this.numberOfCurrentStarsOnBoard;

		// Get a random value from the space locations and fill it with a star tile for how many more star tiles we need
		for (let i = 0; i < numberOfMoreStarsToSpawn; i++) {
			let randomLocation = Math.floor(Math.random() * this.locationsOfSpaces.length);
			this.tiles[this.locationsOfSpaces[randomLocation].y][this.locationsOfSpaces[randomLocation].x].pattern = TilePattern.Star;
			this.numberOfCurrentStarsOnBoard++;
		}

		this.locationsOfSpaces = [];
		this.numberOfSpaceTiles = 0;

		return tweens;
	}

	/**
	 * Automatically swap tiles for the title screen animation.
	 */
	autoSwap() {
		timer.addTask(async () => {
			// Pick initial positions that won't become out of bounds when swapping.
			const tile1Position = {
				x: getRandomPositiveInteger(1, this.height - 2),
				y: getRandomPositiveInteger(1, this.width - 2),
			};
			const tile2Position = {
				x: tile1Position.x,
				y: tile1Position.y,
			};

			// Randomly choose the second tile to be up/down/left/right of tile1.
			switch (getRandomPositiveInteger(0, 4)) {
				case 0:
					tile2Position.x++;
					break;
				case 1:
					tile2Position.x--;
					break;
				case 2:
					tile2Position.y++;
					break;
				default:
					tile2Position.y--;
					break;
			}

			const tile1 = this.tiles[tile1Position.x][tile1Position.y];
			const tile2 = this.tiles[tile2Position.x][tile2Position.y];

			await this.swapTiles(tile1, tile2);
		}, 0.3)
	}

	/**
	 * Swaps the specified tiles behind the scenes.
	 * @param {*} tile1 
	 * @param {*} tile2 
	 */
	async swapTilesHidden(tile1, tile2){
		const temporaryTile = new Tile(
			tile1.boardX, 
			tile1.boardY
		);

		// Swap board positions.
		tile1.boardX = tile2.boardX;
		tile1.boardY = tile2.boardY;
		tile2.boardX = temporaryTile.boardX;
		tile2.boardY = temporaryTile.boardY;

		// Swap tiles in the tiles array.
		this.tiles[tile1.boardY][tile1.boardX] = tile1;
		this.tiles[tile2.boardY][tile2.boardX] = tile2;
	}

	/**
	 * Gets the hint alignment.
	 * @returns 
	 */
	getHintAlignment(){
		return this.hintAlignment;
	}

	/**
	 * Gets the hint matches.
	 * @returns 
	 */
	getHints(){
		return this.hints;
	}

	/**
	 * Checks for swaps for hints.
	 */
	async checkForHintSwaps(){
		this.hints = [];
		await this.resolveHorizontalHintSwaps();
		await this.resolveVerticalHintSwaps();
	}

	/**
	 * Gets all the horizontal tiles that can be swapped for hints.
	 */
	async resolveHorizontalHintSwaps() {
		for (let y = 0; y < Board.SIZE; y++) {
			const secondIndex = 1;

			// For every horizontal tile...
			for (let x = secondIndex; x < Board.SIZE; x++) {

				await this.swapTilesHidden(this.tiles[y][x - 1], this.tiles[y][x]);

				// If there was no hidden match, swap back
				if (await this.matchAfterSwap()){
					await this.swapTilesHidden(this.tiles[y][x], this.tiles[y][x - 1]);
					continue;
				}

				let hintAlignment = this.tiles[y][x - 1].boardX === this.tiles[y][x].boardX
								? Alignment.Vertical
								: Alignment.Horizontal;
				
				// Add the hint match to the array
				this.hints.push({
					tile1: this.tiles[y][x - 1],
					tile2: this.tiles[y][x],
					alignment: hintAlignment
				})

				await this.swapTilesHidden(this.tiles[y][x], this.tiles[y][x - 1]);
			}
		}
	}

	/**
	 * Gets all the vertical tiles that can be swapped for hints.
	 */
	async resolveVerticalHintSwaps() {
		for (let x = 0; x < Board.SIZE; x++) {
			const secondIndex = 1;

			// For every vertical tile...
			for (let y = secondIndex; y < Board.SIZE; y++) {

				await this.swapTilesHidden(this.tiles[y - 1][x], this.tiles[y][x]);

				// If there was no hidden match, swap back
				if (await this.matchAfterSwap()){
					await this.swapTilesHidden(this.tiles[y][x], this.tiles[y - 1][x]);
					continue;
				}

				let hintAlignment = this.tiles[y - 1][x].boardY === this.tiles[y][x].boardY
								? Alignment.Horizontal
								: Alignment.Vertical;
				
				// Add the hint match to the array
				this.hints.push({
					tile1: this.tiles[y - 1][x],
					tile2: this.tiles[y][x],
					alignment: hintAlignment
				})

				await this.swapTilesHidden(this.tiles[y][x], this.tiles[y - 1][x]);
			}
		}
	}
}
