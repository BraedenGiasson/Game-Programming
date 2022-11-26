import Brick from "./Brick.js";
import LockedBrick from "./LockedBrick.js";
import { CANVAS_WIDTH, TILE_SIZE } from "./globals.js";
import { getRandomPositiveNumber, getRandomNumber, getRandomBooleanNumber } from "./utils.js";

/**
 * Creates aan array of bricks to be returned to the main game, with different
 * possible ways of randomizing rows and columns of bricks. Calculates the
 * brick colors and tiers to choose based on the level passed in.
 */
export default class LevelMaker {
	static createMap(level = 1) {
		const bricks = [];
		let numberOfLockedBricks = 0;

		const maxRows = 5;
		const maxColumns = 10;

		// Randomly choose the number of rows.
		const numberOfRows = Math.floor(getRandomPositiveNumber(1, maxRows));

		// Randomly choose the number of columns.
		let numberOfColumns = Math.floor(getRandomPositiveNumber(5, maxColumns));

		// Ensure that the number of columns is odd to get symmetrical brick layouts.
		numberOfColumns = numberOfColumns % 2 === 0 ? (numberOfColumns + 1) : numberOfColumns;

		/**
		 * Highest possible spawned brick color in this level.
		 * Ensure we don't go above 3 since there are only 4 tiers in the sprite sheet.
		 */
		const highestTier = Math.min(3, Math.round(level / 3));

		// Highest color of the highest tier.
		const highestColour = 4;

		// Lay out bricks such that they touch each other and fill the space.
		for (let y = 0; y < numberOfRows; y++) {
			// Whether we want to enable skipping for this row.
			const skipPattern = Math.round(getRandomPositiveNumber(1, 2)) === 1;

			// Whether we want to enable alternating colors for this row.
			let alternatePattern = Math.round(getRandomPositiveNumber(1, 2)) === 1;

			// Choose two colors to alternate between.
			const alternateColour1 = Math.round(getRandomPositiveNumber(0, highestColour));
			const alternateColour2 = Math.round(getRandomPositiveNumber(0, highestColour));
			const alternateTier1 = Math.round(getRandomPositiveNumber(0, highestTier));
			const alternateTier2 = Math.round(getRandomPositiveNumber(0, highestTier));

			// Used only when we want to skip a block, for skip pattern.
			let skipFlag = Math.round(getRandomPositiveNumber(1, 2)) === 1;

			// Used only when we want to alternate a block, for alternate pattern.
			let alternateFlag = Math.round(getRandomPositiveNumber(1, 2)) === 1;

			// Solid color we'll use if we're not skipping or alternating.
			const solidColour = Math.round(getRandomPositiveNumber(0, highestColour));
			const solidTier = Math.round(getRandomPositiveNumber(0, highestTier));

			for (let x = 0; x < numberOfColumns; x++) {
				// If skipping is turned on and we're on a skip iteration...
				if (skipPattern && skipFlag) {
					// Turn skipping off for the next iteration.
					skipFlag = !skipFlag;
					continue;
				}
				else {
					// Flip the flag to true on an iteration we don't use it.
					skipFlag = !skipFlag;
				}

				const brickWidth = TILE_SIZE * 2;
				const brickHeight = TILE_SIZE;
				// Subtracts the column widths & brick widths from the canvas width, then divide by 2 to center in screen
				const xOffset = (CANVAS_WIDTH - (numberOfColumns * brickWidth)) / 2;
				const yOffset = brickHeight * 2;

				let brick;

				/**
				 * Set the columns to the second to last column if there's
				 * a skip flag and if the next index is the last column.
				 * 
				 * (x + 1) === (numberOfColumns - 1) --> Checks if the next index
				 * 										 is the last column.
				 */
				let columns = skipFlag && ((x + 1) === (numberOfColumns - 1))
							  ? numberOfColumns - 2
							  : numberOfColumns - 1;

				/**
				 * True if the last brick should be a locked brick 
				 * (no other locked bricks have been generated)
				 */
				let lastBrickIsBeLockedBrick = columns === (numberOfColumns - 2);

				// If the number of locked bricks added is less than the max
				if(numberOfLockedBricks < LockedBrick.maxAllowedLockedBricks(skipFlag, numberOfRows, numberOfColumns)){
					// Ensure there's at least 1 locked brick being generated per level
					if(lastBrickIsBeLockedBrick || 
							((x === (columns)) && (y === (numberOfRows - 1)) && (numberOfLockedBricks === 0))){
						brick = new LockedBrick(xOffset + (x * brickWidth), yOffset + (y * brickHeight));
						numberOfLockedBricks++;
					}
					// If there's still room to try and add a locked brick
					else{
						let getRandomNumber1 = getRandomBooleanNumber(6);
						let getRandomNumber2 = getRandomBooleanNumber(6);

						// If the random numbers are equal, add a locked brick
						if(getRandomNumber1 === getRandomNumber2){
							brick = new LockedBrick(xOffset + (x * brickWidth), yOffset + (y * brickHeight));
							numberOfLockedBricks++;
						}
						// Otherwise, add a normal brick
						else
							brick = new Brick(xOffset + (x * brickWidth), yOffset + (y * brickHeight));
					}
				}
				// If max locked bricks is reached, add a normal brick
				else
					brick = new Brick(xOffset + (x * brickWidth), yOffset + (y * brickHeight));

				// If we're alternating, figure out which color/tier we're on.
				if (alternatePattern && alternateFlag) {
					// Set color of brick
					brick.colour = brick.isLockedBrick
							       ? brick.getColours().length - 1
								   : alternateColour1;

					// Set the tier of the brick if the brick isn't a locked brick
					if(!brick.isLockedBrick)
						brick.tier = alternateTier1;

					alternateFlag = !alternateFlag;
				}
				else {
					// Set color of brick
					brick.colour = brick.isLockedBrick
							       ? brick.getColours().length - 1
								   : alternateColour2;

					// Set the tier of the brick if the brick isn't a locked brick
					if(!brick.isLockedBrick)
						brick.tier = alternateTier2;

					alternateFlag = !alternateFlag;
				}

				// If not alternating and we made it here, use the solid color/tier.
				if (!alternatePattern) {
					// Set color of brick
					brick.colour = brick.isLockedBrick
							       ? brick.getColours().length - 1
								   : solidColour;

					// Set the tier of the brick if the brick isn't a locked brick
					if(!brick.isLockedBrick)
						brick.tier = solidTier;
				}

				bricks.push(brick);
				continue;
			}
		}

		// In the event we didn't generate any bricks, try again.
		if (bricks.length === 0) {
			return this.createMap(level);
		}
		else {
			return bricks;
		}
	}
}
