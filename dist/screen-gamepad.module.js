/*!
 * screen-gamepad
 * https://github.com/yomotsu/screen-gamepad
 * (c) 2020 @yomotsu
 * Released under the MIT License.
 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var EventDispatcher = (function () {
    function EventDispatcher() {
        this._listeners = {};
    }
    EventDispatcher.prototype.addEventListener = function (type, listener) {
        var listeners = this._listeners;
        if (listeners[type] === undefined)
            listeners[type] = [];
        if (listeners[type].indexOf(listener) === -1)
            listeners[type].push(listener);
    };
    EventDispatcher.prototype.removeEventListener = function (type, listener) {
        var listeners = this._listeners;
        var listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            var index = listenerArray.indexOf(listener);
            if (index !== -1)
                listenerArray.splice(index, 1);
        }
    };
    EventDispatcher.prototype.removeAllEventListeners = function (type) {
        if (!type) {
            this._listeners = {};
            return;
        }
        if (Array.isArray(this._listeners[type]))
            this._listeners[type].length = 0;
    };
    EventDispatcher.prototype.dispatchEvent = function (event) {
        var listeners = this._listeners;
        var listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            var array = listenerArray.slice(0);
            for (var i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    };
    return EventDispatcher;
}());

function findTouchEventById(event, identifier) {
    for (var i = 0, l = event.changedTouches.length; i < l; i++) {
        if (identifier === event.changedTouches[i].identifier) {
            return event.changedTouches[i];
        }
    }
    return null;
}

function isTouchEvent(event) {
    return 'TouchEvent' in window && event instanceof TouchEvent;
}

var $style = document.createElement('style');
$style.innerHTML = "\n.screenGamepad-Joystick {\n\tcursor: pointer;\n\t-ms-touch-action : none;\n\t    touch-action : none;\n\t-webkit-user-select: none;\n\t    -ms-user-select: none;\n\t        user-select: none;\n\tposition: absolute;\n\tbackground: url( \"data:image/svg+xml,%3Csvg%20viewBox=%220%200%20128%20128%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22m64%2011.9%208%208.2h-16z%22%20opacity=%22.5%22/%3E%3Cpath%20d=%22m116.1%2064-8.2%208v-16z%22%20opacity=%22.5%22/%3E%3Cpath%20d=%22m64%20116.1%208-8.2h-16z%22%20opacity=%22.5%22/%3E%3Cpath%20d=%22m11.9%2064%208.2%208v-16z%22%20opacity=%22.5%22/%3E%3Ccircle%20cx=%2264%22%20cy=%2264%22%20fill=%22none%22%20opacity=%22.5%22%20r=%2260%22%20stroke=%22%23000%22%20stroke-width=%228%22/%3E%3C/svg%3E\" ) 0 0 / 100% 100%;\n}\n\n.screenGamepad-Joystick__Button {\n\tpointer-events: none;\n\tposition: absolute;\n\ttop: 20%;\n\tleft: 20%;\n\tbox-sizing: border-box;\n\twidth: 60%;\n\theight: 60%;\n  border-radius: 50%;\n  border: 1px solid #333;\n  background: rgba( 0, 0, 0, .5 );\n}\n";
document.head.insertBefore($style, document.head.firstChild);
var Joystick = (function (_super) {
    __extends(Joystick, _super);
    function Joystick(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.domElement = document.createElement('div');
        _this._size = 128;
        _this._x = 0;
        _this._y = 0;
        _this._angle = 0;
        _this._isActive = false;
        _this._pointerId = -1;
        _this._elRect = new DOMRect();
        _this._$button = document.createElement('div');
        if (options.size)
            _this._size = options.size;
        _this.domElement.classList.add('screenGamepad-Joystick');
        _this.domElement.style.width = _this._size + "px";
        _this.domElement.style.height = _this._size + "px";
        _this._$button.classList.add('screenGamepad-Joystick__Button');
        _this.domElement.appendChild(_this._$button);
        var computePosition = function (offsetX, offsetY) {
            var x = offsetX / _this._size * 2 - 1;
            var y = -offsetY / _this._size * 2 + 1;
            if (x === 0 && y === 0) {
                _this._angle = 0;
                _this._x = 0;
                _this._y = 0;
                return;
            }
            _this._angle = Math.atan2(-y, -x) + Math.PI;
            var length = Math.min(Math.sqrt(x * x + y * y), 1);
            _this._x = Math.cos(_this._angle) * length;
            _this._y = Math.sin(_this._angle) * length;
        };
        var onButtonMove = function (event) {
            event.preventDefault();
            var _isTouchEvent = isTouchEvent(event);
            var _event = _isTouchEvent
                ? findTouchEventById(event, _this._pointerId)
                : event;
            if (!_event)
                return;
            var lastX = _this._x;
            var lastY = _this._y;
            var offsetX = (_event.clientX - window.pageXOffset - _this._elRect.left);
            var offsetY = (_event.clientY - window.pageYOffset - _this._elRect.top);
            computePosition(offsetX, offsetY);
            if (_this._x === lastX && _this._y === lastY)
                return;
            _this._update();
            _this.dispatchEvent({ type: 'change' });
        };
        var onButtonMoveEnd = function (event) {
            event.preventDefault();
            var _isTouchEvent = isTouchEvent(event);
            var _event = _isTouchEvent
                ? event.changedTouches[0]
                : event;
            if (_isTouchEvent && _event.identifier !== _this._pointerId)
                return;
            document.removeEventListener('mousemove', onButtonMove);
            document.removeEventListener('touchmove', onButtonMove, { passive: false });
            document.removeEventListener('mouseup', onButtonMoveEnd);
            document.removeEventListener('touchend', onButtonMoveEnd);
            _this._pointerId = -1;
            _this._isActive = false;
            _this._angle = 0;
            _this._x = 0;
            _this._y = 0;
            _this._update();
            _this.dispatchEvent({ type: 'change' });
            _this.dispatchEvent({ type: 'inactive' });
        };
        var onButtonMoveStart = function (event) {
            event.preventDefault();
            var _isTouchEvent = isTouchEvent(event);
            var _event = _isTouchEvent
                ? event.changedTouches[0]
                : event;
            if (_isTouchEvent) {
                _this._pointerId = _event.identifier;
            }
            _this._elRect = _this.domElement.getBoundingClientRect();
            _this._isActive = true;
            var offsetX = (_event.clientX - window.pageXOffset - _this._elRect.left);
            var offsetY = (_event.clientY - window.pageYOffset - _this._elRect.top);
            computePosition(offsetX, offsetY);
            _this._update();
            document.addEventListener('mousemove', onButtonMove);
            document.addEventListener('touchmove', onButtonMove, { passive: false });
            document.addEventListener('mouseup', onButtonMoveEnd);
            document.addEventListener('touchend', onButtonMoveEnd);
            _this.dispatchEvent({ type: 'active' });
            _this.dispatchEvent({ type: 'change' });
        };
        _this.domElement.addEventListener('mousedown', onButtonMoveStart);
        _this.domElement.addEventListener('touchstart', onButtonMoveStart);
        return _this;
    }
    Object.defineProperty(Joystick.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (x) {
            this._x = x;
            this._update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Joystick.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (y) {
            this._y = y;
            this._update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Joystick.prototype, "angle", {
        get: function () {
            return this._angle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Joystick.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Joystick.prototype._update = function () {
        this._$button.style.transition = this._isActive ? '' : 'transform .1s';
        if (this._x === 0 && this._y === 0) {
            this._$button.style.transform = "translate( 0px, 0px )";
            return;
        }
        var radius = this._size / 2;
        var x = this._x * radius;
        var y = -this._y * radius;
        this._$button.style.transform = "translate( " + x + "px, " + y + "px )";
    };
    return Joystick;
}(EventDispatcher));

var SVG_NS = 'http://www.w3.org/2000/svg';
var $style$1 = document.createElement('style');
$style$1.innerHTML = "\n.screenGamepad-Button {\n\tcursor: pointer;\n\t-ms-touch-action : none;\n\t    touch-action : none;\n\t-webkit-user-select: none;\n\t    -ms-user-select: none;\n\t        user-select: none;\n\tposition: absolute;\n}\n\n.screenGamepad-Button__HitArea {\n\tcolor: rgba( 0, 0, 0, .5 );\n}\n";
document.head.insertBefore($style$1, document.head.firstChild);
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.domElement = document.createElementNS(SVG_NS, 'svg');
        _this._size = 48;
        _this._isActive = false;
        _this._pointerId = -1;
        _this._$hitArea = document.createElementNS(SVG_NS, 'a');
        if (options.size)
            _this._size = options.size;
        _this._$hitArea.innerHTML = options.shape || Button.BUTTON_SHAPE_CIRCLE;
        _this.domElement.classList.add('screenGamepad-Button');
        _this.domElement.setAttribute('viewBox', '0 0 1 1');
        _this.domElement.style.width = _this._size + "px";
        _this.domElement.style.height = _this._size + "px";
        _this._$hitArea.classList.add('screenGamepad-Button__HitArea');
        _this.domElement.appendChild(_this._$hitArea);
        var hitRect = _this.domElement.createSVGRect();
        hitRect.width = 1;
        hitRect.height = 1;
        var onButtonMove = function (event) {
            event.preventDefault();
            var _isTouchEvent = isTouchEvent(event);
            var _event = _isTouchEvent
                ? findTouchEventById(event, _this._pointerId)
                : event;
            if (!_event)
                return;
            var x = _event.clientX;
            var y = _event.clientY;
            var $intersectedElement = document.elementFromPoint(x, y);
            var isIntersected = _this._$hitArea.contains($intersectedElement);
            if (isIntersected && !_this._isActive) {
                _this._isActive = true;
                _this._update();
                _this.dispatchEvent({ type: 'active' });
                _this.dispatchEvent({ type: 'change' });
                return;
            }
            if (!isIntersected && _this._isActive) {
                _this._isActive = false;
                _this._update();
                _this.dispatchEvent({ type: 'inactive' });
                _this.dispatchEvent({ type: 'change' });
                return;
            }
        };
        var onButtonUp = function (event) {
            event.preventDefault();
            document.removeEventListener('mousemove', onButtonMove);
            document.removeEventListener('touchmove', onButtonMove, { passive: false });
            document.removeEventListener('mouseup', onButtonUp);
            document.removeEventListener('touchend', onButtonUp);
            _this._pointerId = -1;
            if (!_this._isActive)
                return;
            _this._isActive = false;
            _this._update();
            _this.dispatchEvent({ type: 'change' });
            _this.dispatchEvent({ type: 'inactive' });
        };
        var onButtonDown = function (event) {
            document.removeEventListener('mousemove', onButtonMove);
            document.removeEventListener('touchmove', onButtonMove, { passive: false });
            document.removeEventListener('mouseup', onButtonUp);
            document.removeEventListener('touchend', onButtonUp);
            event.preventDefault();
            var _isTouchEvent = isTouchEvent(event);
            if (_isTouchEvent) {
                var changedTouches = event.changedTouches;
                _this._pointerId = changedTouches[changedTouches.length - 1].identifier;
            }
            _this._isActive = true;
            _this._update();
            document.addEventListener('mousemove', onButtonMove);
            document.addEventListener('touchmove', onButtonMove, { passive: false });
            document.addEventListener('mouseup', onButtonUp);
            document.addEventListener('touchend', onButtonUp);
            _this.dispatchEvent({ type: 'active' });
            _this.dispatchEvent({ type: 'change' });
        };
        _this.domElement.addEventListener('mousedown', onButtonDown);
        _this.domElement.addEventListener('touchstart', onButtonDown);
        return _this;
    }
    Object.defineProperty(Button, "BUTTON_SHAPE_CIRCLE", {
        get: function () {
            return '<circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" />';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Button.prototype._update = function () { };
    return Button;
}(EventDispatcher));

var utils = {
    roundToStep: function (number, step) {
        return step * Math.round(number / step);
    },
};

export { Button, Joystick, utils };
