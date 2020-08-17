import { EventDispatcher } from './EventDispatcher';
interface JoystickOption {
    size?: number;
}
export declare class Joystick extends EventDispatcher {
    readonly domElement: HTMLDivElement;
    private _size;
    private _x;
    private _y;
    private _angle;
    private _isActive;
    private _pointerId;
    private _elRect;
    private _$button;
    constructor(options?: JoystickOption);
    x: number;
    y: number;
    readonly angle: number;
    readonly isActive: boolean;
    private _update;
}
export {};
