import { BaseComponent } from '../BaseComponent';

export class RotationComponent extends BaseComponent {
    public static readonly componentName = 'RotationComponent';

    public rotation: number = 0;
    public rotationSpeed: number = 0;

    constructor(rotationSpeed: number = 0) {
        super();
        this.rotationSpeed = rotationSpeed;
    }

    public setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }

    public addRotation(deltaRotation: number): void {
        this.setRotation(this.rotation + deltaRotation);
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation % 360;
        if (this.rotation < 0) {
            this.rotation += 360;
        }
    }
} 