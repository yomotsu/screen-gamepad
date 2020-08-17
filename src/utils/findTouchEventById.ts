export function findTouchEventById( event: TouchEvent, identifier: number ) {

	for ( let i = 0, l = event.changedTouches.length; i < l; i ++ ) {

		if ( identifier === event.changedTouches[ i ].identifier ) {

			return event.changedTouches[ i ];

		}

	}

	return event.changedTouches[ 0 ];

}
