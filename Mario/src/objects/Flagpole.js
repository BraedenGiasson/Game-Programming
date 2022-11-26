import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images, stateMachine } from "../globals.js";
import GameObject from "./GameObject.js";
import Tile from "./Tile.js";
import { getRandomPositiveInteger } from "../../lib/RandomNumberHelpers.js";
import Flag from "./Flag.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import LevelMaker from "../services/LevelMaker.js";
import GameStateName from "../enums/GameStateName.js";

export default class Flagpole extends GameObject{
    static SIZE = 4;
    static HEIGHT = Flagpole.SIZE * 12;
    static WIDTH = Flagpole.SIZE * 2;
    static TOTAL_SPRITES = 6;
    static SPLIT = 2;

    /**
     * Instatiates a new instance of the Flagpole class.
     * Represents a flagpole that the player can grab at the end of the level.
     * @param {*} dimensions 
     * @param {*} position 
     */
    constructor(dimensions, position){
        super(dimensions, position);

        this.isCollidable = true;
        this.isSolid = true;

        this.sprites = Flagpole.generateSprites();
        this.currentFrame = getRandomPositiveInteger(0, Flagpole.TOTAL_SPRITES - 1);

        this.flag = new Flag(
            new Vector(Flag.FLAG_SIZE_1, Flag.FLAG_HEIGHT_3),
			new Vector(position.x + Flagpole.WIDTH - 2, position.y + 5),
            this.currentFrame
        );
    }

    update(dt) {
        if (!this.flag){
            console.log();
        }

		this.flag.update(dt);
	}

    render() {
		super.render();
        this.flag.render();
	}

    /**
     * Generates an array of sprites that represent the flagpole.
     * @returns 
     */
    static generateSprites(){
        const sprites = [];

        for (let x = Flagpole.SIZE; sprites.length < Flagpole.TOTAL_SPRITES; (x += (Flagpole.SIZE * 4))) {
            sprites.push(new Sprite(
                images.get(ImageName.Flagpole),
                x,
                0,
                Flagpole.WIDTH,
                Flagpole.HEIGHT
            ))      
        }  

        return sprites;
    }

    onCollision(collider) {
        super.onCollision(collider);

        // // Generate the new level
		let level = LevelMaker.generateLevel(LevelMaker.getLevelNumber() + 1);

		// Create the new player
		let newPlayer = new Player(
			new Vector(Player.WIDTH, Player.HEIGHT),
			new Vector(Player.WIDTH, 0),
			new Vector(Player.VELOCITY_LIMIT, Player.VELOCITY_LIMIT),
			level,
            collider.score
		);

		// Generate the snails
		LevelMaker.generateSnails(level, newPlayer);

		// Change states
		stateMachine.change(GameStateName.Play, {
            level: level,
			player: newPlayer
        });
	}
}