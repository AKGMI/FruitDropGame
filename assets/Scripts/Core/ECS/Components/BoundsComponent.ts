import { BaseComponent } from '../BaseComponent';

export class BoundsComponent extends BaseComponent {
    public width: number = 0;
    public height: number = 0;

    constructor(width: number = 0, height: number = 0) {
        super();
        this.width = width;
        this.height = height;
    }

    public setBounds(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public getArea(): number {
        return this.width * this.height;
    }
} 