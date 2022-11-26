import Entity from "../entities/Entity.js";
import { timer } from "../globals.js";
import Background from "./Background.js";
import Player from "../entities/Player.js";
import Flagpole from "./Flagpole.js";
import Vector from "../../lib/Vector.js";
import LevelMaker from "../services/LevelMaker.js";
import Tile from "./Tile.js";
import Flag from "./Flag.js";

export default class Level {
	constructor(tilemap, entities = [], objects = []) {
		this.tilemap = tilemap;
		this.entities = entities;
		this.objects = objects;
		this.background = new Background(this.tilemap.canvasDimensions);
	}

	update(dt) {
		this.cleanUpEntitiesAndObjects();

		timer.update(dt);

		this.tilemap.update(dt);
		this.background.update();

		this.objects.forEach((object) => {
			object.update(dt);
		});

		this.entities.forEach((entity) => {
			entity.update(dt);
		});
	}

	render() {
		this.background.render();
		this.tilemap.render();

		this.objects.forEach((object) => {
			object.render();
		});

		this.entities.forEach((entity) => {
			entity.render();
		});
	}

	cleanUpEntitiesAndObjects() {
		this.entities = this.entities.filter((entity) => !entity.cleanUp);
		this.objects = this.objects.filter((object) => !object.cleanUp);

		this.checkToAddFlagpole();
	}

	/**
	 * @param {Entity} entity
	 */
	addEntity(entity) {
		this.entities.push(entity);
	}

	/**
	 * Checks if there are no more snails left on the map. 
	 * @returns True if there are no more snails; otherwise false.
	 */
	noMoreSnails(){
		return this.entities.every((entity) => entity instanceof Player);
	}

	addCamera(camera) {
		this.background.addCamera(camera);
	}

	/**
	 * Checks to add flagpole if no more snails.
	 */
	checkToAddFlagpole(){
		// Get number of flagpoles to see if we spawn one
		let numberOfFlagpoles = this.objects.filter((object) => object instanceof Flagpole);

		// Only add flagpole if all snails are dead
		if (numberOfFlagpoles.length === 0 && this.noMoreSnails()){
			this.addFlagpole();
		}
	}

	/**
	 * Adds the flagpole to the array of objects on the screen.
	 */
	addFlagpole(){
		// Gets the number of tiles from the end of the map to spawn at location
		let numberTileFromEndX = this.tilemap.tiles[LevelMaker.GROUND_HEIGHT].length - LevelMaker.TILE_TO_SPAWN_FLAG_X;
		// The 'x' location on the canvas to spawn the flagpole
		let locationX = this.background.canvasDimensions.x - (Tile.SIZE * numberTileFromEndX);

		// Gets the number of tiles from the bottom of the ground height to spawn at location
		let numberTileFromEndY = LevelMaker.GROUND_HEIGHT - LevelMaker.TILE_TO_SPAWN_FLAG_Y;
		// The default location to spawn the flagpole (ground height)
		let defaultTilesFromGround = (Tile.SIZE * LevelMaker.TILE_SETS_HEIGHT) + Tile.SIZE;
		// The 'y' location on the canvas to spawn the flagpole
		let locationY = defaultTilesFromGround - (Tile.SIZE * numberTileFromEndY);

		// Create the new flagpole
		this.objects.push(new Flagpole(
			new Vector(Flagpole.WIDTH, Flagpole.HEIGHT),
			new Vector(locationX + (Tile.SIZE / 4), locationY)
		));
	}
}
