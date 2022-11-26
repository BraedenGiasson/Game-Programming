import GameObject from "./GameObject.js";
import Tile from "./Tile.js";
import { images, sounds, timer } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import TypeOfCharacter from "../enums/TypeOfCharacter.js";
import Player from "../entities/Player.js";

export default class Star extends GameObject {
	static WIDTH = Tile.SIZE;
	static HEIGHT = Tile.SIZE;
	static TOTAL_SPRITES = 1;
	static SUCCEED_CHANCE = 0.3;

	/**
	 * A collectible item that the player can consume to gain points.
	 *
	 * @param {Vector} dimensions
	 * @param {Vector} position
	 */
	constructor(dimensions, position) {
		super(dimensions, position);

		this.isConsumable = true;

		this.sprites = Star.generateSprites();

		this.maxTimer = 10; 
		this.minTimer = 0;
		this.timer = 0;
		this.INTERVAL_FOR_TIMER = 1;
	}

	onConsume(player) {
		if (this.wasConsumed) {
			return;
		}
		
		super.onConsume();
		sounds.play(SoundName.PickUp);
		this.cleanUp = true;

		this.startTimer(player);
	}

	static generateSprites() {
		const sprites = [];

		for (let x = 0; x < Star.TOTAL_SPRITES; x++) {
			sprites.push(new Sprite(
				images.get(ImageName.Star),
				0,
				Tile.SIZE * 2,
				Star.WIDTH,
				Star.HEIGHT
			));
		}

		return sprites;
	}

	/**
	 * Starts the timer for the invisible player.
	 * @param {*} player The player.
	 */
	startTimer(player){
		this.timerId = 1;

		player.timer += this.maxTimer;
		
		// Remove the timer
		if (Player.STARTED_INVISIBLE_TIMER) {
			timer.tasks.splice(timer.tasks.findIndex((task) => task.id === this.timerId), 1);
			Player.STARTED_INVISIBLE_TIMER = false;
		}
		
		player.changeCharacterType(TypeOfCharacter.Blue);

		// Set the initial time for the invisible player
		player.setTime(player.timer, this.timerId);

		// Add the timer task
		timer.addTask(() => {
			player.timer--;
			player.setTime(player.timer, this.timerId);
		},
			this.INTERVAL_FOR_TIMER,
			player.timer,
			() => {
				player.changeCharacterType(TypeOfCharacter.Green);
				Player.STARTED_INVISIBLE_TIMER = false;
			},
			this.timerId
		);

		Player.STARTED_INVISIBLE_TIMER = true;
	}
}
