export function getRandomNumber(min, max) {
	return (Math.random() * (max - min) + min) * (Math.random() < 0.5 ? -1 : 1);
}

/**
 * Gets a random whole number between 0 and the specified max value.
 * @param {*} max The maximum value (not included).
 * @returns A random whole number between 0 and the specified max value.
 */
export function getRandomBooleanNumber(max){
	return (Math.floor(Math.random() * max));
}

export function getRandomPositiveNumber(min, max) {
	return (Math.random() * (max - min) + min);
}

export function getRandomNegativeNumber(min, max) {
	return (Math.random() * (max - min) + min) * -1;
}
