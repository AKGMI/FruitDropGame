import { BaseComponent } from '../BaseComponent';

export enum FruitType {
    APPLE = 'apple',
    BANANA = 'banana', 
    ORANGE = 'orange',
    
    MUSHROOM = 'mushroom'
}

export class FruitComponent extends BaseComponent {
    public type: FruitType;
    public score: number;

    constructor(type: FruitType) {
        super();
        this.type = type;
        this.score = this.getScoreForType(type);
    }

    private getScoreForType(type: FruitType): number {
        switch (type) {
            case FruitType.APPLE:
                return 10;
            case FruitType.BANANA:
                return 15;
            case FruitType.ORANGE:
                return 20;
            case FruitType.MUSHROOM:
                return -1;
            default:
                return 10;
        }
    }

    public isHazard(): boolean {
        return this.score < 0;
    }

    public getDamage(): number {
        return this.isHazard() ? Math.abs(this.score) : 0;
    }
} 