import { BaseComponent } from '../BaseComponent';
import { GameConstants } from '../../Constants/GameConstants';

export class BasketComponent extends BaseComponent {
    public speed: number;
    public width: number;

    constructor(speed: number = GameConstants.BASKET_SPEED, width: number = GameConstants.BASKET_SIZE.width) {
        super();
        this.speed = speed;
        this.width = width;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    public setWidth(width: number): void {
        this.width = width;
    }
} 