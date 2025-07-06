import { BaseComponent } from '../BaseComponent';

export class VelocityComponent extends BaseComponent {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    public setVelocity(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public addVelocity(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    public multiplyVelocity(factor: number): void {
        this.x *= factor;
        this.y *= factor;
    }
} 