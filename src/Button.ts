import { EventDispatcher } from './EventDispatcher';
import { isTouchEvent } from './utils/isTouchEvent';
import { findTouchEventById } from './utils/findTouchEventById';

const SVG_NS = 'http://www.w3.org/2000/svg';

const $style = document.createElement( 'style' );
$style.innerHTML = `
.screenGamepad-Button {
	cursor: pointer;
	-ms-touch-action : none;
	    touch-action : none;
	-webkit-user-select: none;
	    -ms-user-select: none;
	        user-select: none;
	position: absolute;
}

.screenGamepad-Button__HitArea {
	color: rgba( 0, 0, 0, .5 );
}
`;
document.head.insertBefore( $style, document.head.firstChild );

interface ButtonOption {
	size?: number;
	shape?: string;
}

export class Button extends EventDispatcher {

	readonly domElement = document.createElementNS( SVG_NS, 'svg' );

	private _size = 48;
	private _isActive = false;
	private _pointerId = - 1;
	private _$hitArea = document.createElementNS( SVG_NS, 'a' );

	static get BUTTON_SHAPE_CIRCLE() {

		return '<circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" />';

	}

	constructor( options: ButtonOption = {} ) {

		super();

		if ( options.size ) this._size = options.size;
		this._$hitArea.innerHTML = options.shape || Button.BUTTON_SHAPE_CIRCLE;

		this.domElement.classList.add( 'screenGamepad-Button' );
		this.domElement.setAttribute( 'viewBox', '0 0 1 1' );
		this.domElement.style.width = `${ this._size }px`;
		this.domElement.style.height = `${ this._size }px`;

		this._$hitArea.classList.add( 'screenGamepad-Button__HitArea' );
		this.domElement.appendChild( this._$hitArea );

		const hitRect = this.domElement.createSVGRect();
		hitRect.width = 1;
		hitRect.height = 1;

		const onButtonMove = ( event: Event ) => {

			event.preventDefault();

			const _isTouchEvent = isTouchEvent( event );
			const _event = _isTouchEvent
				? findTouchEventById( event as TouchEvent, this._pointerId )
				: ( event as MouseEvent );

			const x = _event.clientX;
			const y = _event.clientY;
			const $intersectedElement = document.elementFromPoint( x, y );
			const isIntersected = this._$hitArea.contains( $intersectedElement );

			if ( isIntersected && ! this._isActive ) {

				this._isActive = true;
				this._update();
				this.dispatchEvent( { type: 'active' } );
				this.dispatchEvent( { type: 'change' } );
				return;

			}

			if ( ! isIntersected && this._isActive ) {

				this._isActive = false;
				this._update();
				this.dispatchEvent( { type: 'inactive' } );
				this.dispatchEvent( { type: 'change' } );
				return;

			}

		};

		const onButtonUp = ( event: Event ) => {

			event.preventDefault();

			document.removeEventListener( 'mousemove', onButtonMove );
			document.removeEventListener( 'touchmove', onButtonMove, { passive: false } as AddEventListenerOptions );
			document.removeEventListener( 'mouseup', onButtonUp );
			document.removeEventListener( 'touchend', onButtonUp );

			this._pointerId = - 1;

			if ( ! this._isActive ) return;

			this._isActive = false;
			this._update();
			this.dispatchEvent( { type: 'change' } );
			this.dispatchEvent( { type: 'inactive' } );

		};

		const onButtonDown = ( event: Event ) => {

			document.removeEventListener( 'mousemove', onButtonMove );
			document.removeEventListener( 'touchmove', onButtonMove, { passive: false } as AddEventListenerOptions );
			document.removeEventListener( 'mouseup', onButtonUp );
			document.removeEventListener( 'touchend', onButtonUp );

			event.preventDefault();
			const _isTouchEvent = isTouchEvent( event );

			if ( _isTouchEvent ) {

				const changedTouches = ( event as TouchEvent ).changedTouches;
				this._pointerId = changedTouches[ changedTouches.length - 1 ].identifier;

			}

			this._isActive = true;
			this._update();

			document.addEventListener( 'mousemove', onButtonMove );
			document.addEventListener( 'touchmove', onButtonMove, { passive: false } as AddEventListenerOptions );
			document.addEventListener( 'mouseup', onButtonUp );
			document.addEventListener( 'touchend', onButtonUp );

			this.dispatchEvent( { type: 'active' } );
			this.dispatchEvent( { type: 'change' } );

		};

		this.domElement.addEventListener( 'mousedown', onButtonDown );
		this.domElement.addEventListener( 'touchstart', onButtonDown );

	}

	get isActive() {

		return this._isActive;

	}

	_update() {}

}
