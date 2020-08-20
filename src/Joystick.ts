import { EventDispatcher } from './EventDispatcher';
import { findTouchEventById } from './utils/findTouchEventById';
import { isTouchEvent } from './utils/isTouchEvent';

const $style = document.createElement( 'style' );
$style.innerHTML = `
.screenGamepad-Joystick {
	cursor: pointer;
	-ms-touch-action : none;
	    touch-action : none;
	-webkit-user-select: none;
	    -ms-user-select: none;
	        user-select: none;
	position: absolute;
	background: url( "data:image/svg+xml,%3Csvg%20viewBox=%220%200%20128%20128%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22m64%2011.9%208%208.2h-16z%22%20opacity=%22.5%22/%3E%3Cpath%20d=%22m116.1%2064-8.2%208v-16z%22%20opacity=%22.5%22/%3E%3Cpath%20d=%22m64%20116.1%208-8.2h-16z%22%20opacity=%22.5%22/%3E%3Cpath%20d=%22m11.9%2064%208.2%208v-16z%22%20opacity=%22.5%22/%3E%3Ccircle%20cx=%2264%22%20cy=%2264%22%20fill=%22none%22%20opacity=%22.5%22%20r=%2260%22%20stroke=%22%23000%22%20stroke-width=%228%22/%3E%3C/svg%3E" ) 0 0 / 100% 100%;
}

.screenGamepad-Joystick__Button {
	pointer-events: none;
	position: absolute;
	top: 20%;
	left: 20%;
	box-sizing: border-box;
	width: 60%;
	height: 60%;
  border-radius: 50%;
  border: 1px solid #333;
  background: rgba( 0, 0, 0, .5 );
}
`;
document.head.insertBefore( $style, document.head.firstChild );

interface JoystickOption {
	size?: number;
}

export class Joystick extends EventDispatcher {

	readonly domElement = document.createElement( 'div' );

	private _size = 128;
	private _x = 0; // -1 to 1
	private _y = 0; // -1 to 1
	private _angle = 0; // in radian
	private _isActive = false;
	private _pointerId = - 1;
	private _elRect = new DOMRect();
	private _$button = document.createElement( 'div' );

	constructor( options: JoystickOption = {} ) {

		super();

		if ( options.size ) this._size = options.size;

		this.domElement.classList.add( 'screenGamepad-Joystick' );
		this.domElement.style.width = `${ this._size }px`;
		this.domElement.style.height = `${ this._size }px`;

		this._$button.classList.add( 'screenGamepad-Joystick__Button' );
		this.domElement.appendChild( this._$button );

		const computePosition = ( offsetX: number, offsetY: number ) => {

			const x =   offsetX / this._size * 2 - 1;
			const y = - offsetY / this._size * 2 + 1;

			if ( x === 0 && y === 0 ) {

				this._angle = 0;
				this._x = 0;
				this._y = 0;
				return;

			}

			this._angle = Math.atan2( - y, - x ) + Math.PI;
			const length = Math.min( Math.sqrt( x * x + y * y ), 1 );
			this._x = Math.cos( this._angle ) * length;
			this._y = Math.sin( this._angle ) * length;

		};

		const onButtonMove = ( event: Event ) => {

			event.preventDefault();

			const _isTouchEvent = isTouchEvent( event );
			const _event = _isTouchEvent
				? findTouchEventById( event as TouchEvent, this._pointerId )
				: ( event as MouseEvent );

			if ( ! _event ) return; // if multi-touch move doesn't contain `this._pointerId`

			const lastX = this._x;
			const lastY = this._y;
			const offsetX = ( _event.clientX - window.pageXOffset - this._elRect.left );
			const offsetY = ( _event.clientY - window.pageYOffset - this._elRect.top );
			computePosition( offsetX, offsetY );

			// position is not changed. the event should be caused by another finger.
			if ( this._x === lastX && this._y === lastY ) return;

			this._update();
			this.dispatchEvent( { type: 'change' } );

		};

		const onButtonMoveEnd = ( event: Event ) => {

			event.preventDefault();

			const _isTouchEvent = isTouchEvent( event );
			const _event = _isTouchEvent
				? ( event as TouchEvent ).changedTouches[ 0 ]
				: ( event as MouseEvent );

			if ( _isTouchEvent && ( _event as Touch ).identifier !== this._pointerId ) return;

			document.removeEventListener( 'mousemove', onButtonMove );
			document.removeEventListener( 'touchmove', onButtonMove, { passive: false } as AddEventListenerOptions );
			document.removeEventListener( 'mouseup', onButtonMoveEnd );
			document.removeEventListener( 'touchend', onButtonMoveEnd );

			this._pointerId = - 1;
			this._isActive = false;
			this._angle = 0;
			this._x = 0;
			this._y = 0;
			this._update();

			this.dispatchEvent( { type: 'change' } );
			this.dispatchEvent( { type: 'inactive' } );

		};

		const onButtonMoveStart = ( event: Event ) => {

			event.preventDefault();
			const _isTouchEvent = isTouchEvent( event );
			const _event = _isTouchEvent
				? ( event as TouchEvent ).changedTouches[ 0 ]
				: ( event as MouseEvent );

			if ( _isTouchEvent ) {

				this._pointerId = ( _event as Touch ).identifier;

			}

			this._elRect = this.domElement.getBoundingClientRect();
			this._isActive = true;
			const offsetX = ( _event.clientX - window.pageXOffset - this._elRect.left );
			const offsetY = ( _event.clientY - window.pageYOffset - this._elRect.top );
			computePosition( offsetX, offsetY );
			this._update();

			document.addEventListener( 'mousemove', onButtonMove );
			document.addEventListener( 'touchmove', onButtonMove, { passive: false } as AddEventListenerOptions );
			document.addEventListener( 'mouseup', onButtonMoveEnd );
			document.addEventListener( 'touchend', onButtonMoveEnd );

			this.dispatchEvent( { type: 'active' } );
			this.dispatchEvent( { type: 'change' } );

		};

		this.domElement.addEventListener( 'mousedown', onButtonMoveStart );
		this.domElement.addEventListener( 'touchstart', onButtonMoveStart );

	}

	get x() {

		return this._x;

	}

	set x( x: number ) {

		this._x = x;
		this._update();

	}

	get y() {

		return this._y;

	}

	set y( y: number ) {

		this._y = y;
		this._update();

	}

	get angle() {

		return this._angle;

	}

	get isActive() {

		return this._isActive;

	}

	private _update() {

		this._$button.style.transition = this._isActive ? '' : 'transform .1s';

		if ( this._x === 0 && this._y === 0 ) {

			this._$button.style.transform = `translate( 0px, 0px )`;
			return;

		}

		const radius = this._size / 2;
		const x =   this._x * radius;
		const y = - this._y * radius;
		this._$button.style.transform = `translate( ${ x }px, ${ y }px )`;

	}

}
