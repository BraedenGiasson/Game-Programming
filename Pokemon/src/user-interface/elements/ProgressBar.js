
import { roundedHalfRectangle, roundedRectangle } from "../../../lib/DrawingHelpers.js";
import Colour from "../../enums/Colour.js";
import { context, timer } from "../../globals.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import Panel from "./Panel.js";

export default class ProgressBar extends UserInterfaceElement {
    static GREEN_BAR = 1;
    static YELLOW_BAR = 0.5;
    static RED_BAR = 0.25;
	static WIDTH = 5.1;
	static HEIGHT = 0.34;
	static BORDER_WIDTH = 6.5;

	constructor(
		x, y, 
		width, height, 
		checkProgressBarDone,
		colour = Colour.White,
		initialWidth = null,
		canRender = true,
		isExperience = false) 
	{
		super(x, y, width, height);

		this.colour = colour;
		this.canRender = canRender;
		this.isExperience = isExperience;
		this.progressBarDonePosition = checkProgressBarDone;
		
		this.initialValue = {
			x: initialWidth === null ? this.dimensions.x - 2.5 : initialWidth,
			y: this.dimensions.y
		};
		
		this.maxValue = {
			x: this.initialValue.x - ProgressBar.BORDER_WIDTH / 4
		}

		this.initialValues = {
			x: this.position.x + ProgressBar.BORDER_WIDTH / 4,
		}
		this.endValues = {
			x: this.dimensions.x - 5
			// x: this.initialValues.x + this.dimensions.x
		}
    }

    render(){
		this.renderBackground();
		this.renderForeground();
		this.renderBar();
    }

	renderBackground() {
		context.fillStyle = Colour.Black;
		
		roundedRectangle(
			context,
			this.position.x,
			this.position.y,
			this.dimensions.x,
			this.dimensions.y,
			ProgressBar.BORDER_WIDTH,
			true,
			false
		);
	}

	renderForeground() {
		context.fillStyle = Colour.White;

		roundedRectangle(
			context,
			this.position.x + ProgressBar.BORDER_WIDTH / 4,
			this.position.y + 2.5,
			this.dimensions.x - 3,
			this.dimensions.y - 4.5,
			ProgressBar.BORDER_WIDTH,
			true,
			false
		);
	}

	renderBar() {
		// Only change colour if the progress bar isn't for experience
		if (!this.isExperience){
			// Change the colour to green
			if (this.getProgressBarCompletion() <= ProgressBar.GREEN_BAR){
				this.colour = Colour.Green;
			}
			// Change the colour to yellow
			if (this.getProgressBarCompletion() <= ProgressBar.YELLOW_BAR){
				this.colour = Colour.Yellow;
			}
			// Change the colour to red
			if (this.getProgressBarCompletion() <= ProgressBar.RED_BAR){
				this.colour = Colour.Red;
			}
		}

		// Change the rectangle to have a solid edge
		if (this.initialValue.x <= this.maxValue.x){
			this.progressBarDonePosition = false;
		}

		context.fillStyle = this.colour;

		if (this.canRender){
			// Render normal rounded rectangle
			if (this.checkProgressBarDone()){
				roundedRectangle(
					context,
					this.position.x + ProgressBar.BORDER_WIDTH / 4,
					this.position.y + 2.5,
					this.initialValue.x,
					this.dimensions.y - 4.5,
					ProgressBar.BORDER_WIDTH,
					true,
					false
				);
			}
			else {
				// Render edge rounded rectangle
				roundedHalfRectangle(
					context,
					this.position.x + ProgressBar.BORDER_WIDTH / 4,
					this.position.y + 2.5,
					this.initialValue.x,
					this.dimensions.y - 4.5,
					ProgressBar.BORDER_WIDTH,
					true,
					false
				);
			}
		}

		context.fillStyle = Colour.Black;
	}

	/**
	 * Checks if the progress bar is done.
	 * @returns True if the progress bar is done (reached final location); otherwise false.
	 */
	checkProgressBarDone(){
		return this.progressBarDonePosition;
	}

	/**
	 * Gets the percentage value indicating how much of the progress bar is filled in.
	 * @returns The percentage value indicating how much of the progress bar is filled in.
	 */
	getProgressBarCompletion(){
		return Math.trunc((Math.floor(this.initialValue.x) / this.maxValue.x) * 100) / 100;
	}
}