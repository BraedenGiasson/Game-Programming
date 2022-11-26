import Ball from "./Ball.js";

export default class Balls {
    /**
     * Instantiates a new instance of the Balls class.
     * Used to manipulate all the balls on the screen.
     */
    constructor(){
        this.createBalls();
    }

    /**
     * Creates the balls array and adds a starting ball.
     */
    createBalls(){
        this.balls = [];
        this.addNewBall();
    }

    /**
     * Adds a ball to the array of balls.
     */
    addNewBall(){
        this.balls.push(new Ball());
    }

    /**
     * Gets all the balls being displayed on the screen.
     * @returns The balls array.
     */
    getAllBalls(){
        return this.balls;
    }

    /**
     * Gets the number of balls in the balls array.
     * @returns The number of balls in the balls array.
     */
    getNumberOfBalls(){
        return this.balls.length;
    }

    /**
     * Gets the ball at the specified index.
     * @param {*} index The index of the ball in the balls array.
     * @returns The ball at the specified index.
     */
    getBallAtIndex(index){
        return this.balls[index];
    }

    /**
     * Removes the ball at the specified index.
     * @param {*} index The index of the ball to remove.
     */
    removeBall(index){
        this.balls.splice(index, 1);
    }

    /**
     * Resets the balls array.
     */
    resetBalls(){
        this.createBalls();
    }
}