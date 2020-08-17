export const utils = {

	roundToStep( number: number, step: number ) {

		return step * Math.round( number / step );

	},

};
