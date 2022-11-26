import Animation from "../../lib/Animation.js";
import Sprite from "../../lib/Sprite.js";
import FlagpoleColor from "../enums/FlagpoleColor.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import GameObject from "./GameObject.js";

export default class Flag extends GameObject{
    static STARTING_POINT = 96;
    static NUMBER_DIFF_COLOR_FLAGS = 4;
    static NUMBER_FLAGS_PER_COLOR = 3;
    static FLAG_SIZE_1 = 16;
    static FLAG_SIZE_2 = 16;
    static FLAG_SIZE_3 = 6;
    static FLAG_HEIGHT_1_2 = 10;
    static FLAG_HEIGHT_3 = 15;
    static TOTAL_SPRITES = 12;
    static Y_INTERVAL = 16;

    /**
     * Instatiates a new instance of the Flag class.
     * Represents a flag that the player can grab at the end of the level.
     * @param {*} dimensions 
     * @param {*} position 
     */
     constructor(dimensions, position, flagpoleFrame){
        super(dimensions, position);

        this.sprites = Flag.generateSprites();
        
        switch (flagpoleFrame) {
            // Animation for white blue flag
            case FlagpoleColor.White:
                this.animation = new Animation([9, 10], 0.1);
                this.currentFrame = 9;
                break;
             // Animation for white red flag
            case FlagpoleColor.Black:
                this.animation = new Animation([6, 7], 0.1);
                this.currentFrame = 6;
                break;
             // Animation for white yellow flag
            case FlagpoleColor.Yellow:
                this.animation = new Animation([0, 1], 0.1);
                this.currentFrame = 0;
                break;
             // Animation for white green flag
            case FlagpoleColor.Green:
                this.animation = new Animation([3, 4], 0.1);
                this.currentFrame = 3;
                break;
             // Animation for white red flag
            case FlagpoleColor.Red:
                this.animation = new Animation([6, 7], 0.1);
                this.currentFrame = 6;
                break;
             // Animation for white blue flag
            case FlagpoleColor.Blue:
                this.animation = new Animation([9, 10], 0.1);
                this.currentFrame = 9;
                break;
        }
    }

    update(dt) {
        this.animation.update(dt);
		this.currentFrame = this.animation.getCurrentFrame();
	}

    render() {
		super.render();
	}
    
    /**
     * Generates an array of sprites that represent the flag.
     * @returns 
     */
     static generateSprites(){
        const sprites = [];

        // Loop over the 4 rows of flag sets
        for (let y = 0; sprites.length < Flag.TOTAL_SPRITES; (y += Flag.Y_INTERVAL)) {
            // Loop over the current row of flags
            for (let x = 0; x < Flag.NUMBER_FLAGS_PER_COLOR; x++) {
                switch (x) {
                    // First flag
                    case 0:
                        sprites.push(new Sprite(
                            images.get(ImageName.Flagpole),
                            Flag.STARTING_POINT,
                            y,
                            Flag.FLAG_SIZE_1,
                            Flag.FLAG_HEIGHT_1_2
                        )) 
                        break;
                    // Second flag
                    case 1:
                        sprites.push(new Sprite(
                            images.get(ImageName.Flagpole),
                            Flag.STARTING_POINT + Flag.FLAG_SIZE_1,
                            y,
                            Flag.FLAG_SIZE_2,
                            Flag.FLAG_HEIGHT_1_2
                        )) 
                        break;
                    // Third flag
                    case Flag.NUMBER_FLAGS_PER_COLOR - 1:
                        sprites.push(new Sprite(
                            images.get(ImageName.Flagpole),
                            Flag.STARTING_POINT + Flag.FLAG_SIZE_1 + Flag.FLAG_SIZE_2,
                            y,
                            Flag.FLAG_SIZE_3,
                            Flag.FLAG_HEIGHT_3
                        )) 
                        break;
                }
            }
        }

        return sprites;
    }
}