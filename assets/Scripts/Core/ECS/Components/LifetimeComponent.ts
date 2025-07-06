import { BaseComponent } from '../BaseComponent';
import { GameConstants } from '../../Constants/GameConstants';

export class LifetimeComponent extends BaseComponent {
    public static readonly componentName = 'LifetimeComponent';

    public maxAge: number;
    public currentAge: number = 0;

    constructor(maxAge: number = GameConstants.FRUIT_LIFETIME) {
        super();
        this.maxAge = maxAge;
    }

    public update(deltaTime: number): void {
        this.currentAge += deltaTime;
    }

    public isExpired(): boolean {
        return this.currentAge >= this.maxAge;
    }

    public getProgress(): number {
        return this.currentAge / this.maxAge;
    }
} 