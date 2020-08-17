import { EventDispatcher } from './EventDispatcher';
interface ButtonOption {
    size?: number;
    shape?: string;
}
export declare class Button extends EventDispatcher {
    readonly domElement: SVGSVGElement;
    private _size;
    private _isActive;
    private _pointerId;
    private _$hitArea;
    static readonly BUTTON_SHAPE_CIRCLE: string;
    constructor(options?: ButtonOption);
    readonly isActive: boolean;
    _update(): void;
}
export {};
