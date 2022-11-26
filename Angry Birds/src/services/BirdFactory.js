import Bird from "../entities/Bird.js";
import BlackBird from "../entities/birds/BlackBird.js";
import RedBird from "../entities/birds/RedBird.js";
import YellowBird from "../entities/birds/YellowBird.js";
import BirdType from "../enums/BirdType.js";

export default class BirdFactory {
	/**
	 * Encapsulates the instantiation logic for creating birds.
	 * This method should be extended when adding new birds.
	 *
	 * @param {object} type Uses the BirdType enum.
	 * @returns An instance of a Bird.
	 */
	 static createInstance(type, x, y) {
		switch (type) {
			case BirdType.Red:
				return new RedBird(x, y, BirdType.Red);
			case BirdType.Yellow:
				return new YellowBird(x, y, BirdType.Yellow);
			case BirdType.Black:
				return new BlackBird(x, y, BirdType.Black);
		}
	}
}
