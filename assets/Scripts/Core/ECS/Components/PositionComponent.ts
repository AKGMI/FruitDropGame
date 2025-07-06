import { BaseComponent } from '../BaseComponent';

export class PositionComponent extends BaseComponent {
    public static readonly componentName = 'PositionComponent';
    
    public x: number = 0;
    public y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public addPosition(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }
} 