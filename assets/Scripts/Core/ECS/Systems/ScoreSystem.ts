import { BaseSystem } from '../BaseSystem';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class ScoreSystem extends BaseSystem {
    private currentScore: number = 0;
    private currentMultiplier: number = 1.0;

    public onLoad(): void {
        EventBus.on(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.on(GameEvents.COMBO_MULTIPLIER_CHANGED, this.onMultiplierChanged.bind(this));
    }

    public onDestroy(): void {
        EventBus.off(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.off(GameEvents.COMBO_MULTIPLIER_CHANGED, this.onMultiplierChanged.bind(this));
    }

    private onFruitCollected(data: any): void {
        const baseScore = data.score;
        const finalScore = baseScore > 0 ? Math.floor(baseScore * this.currentMultiplier) : baseScore;
        
        this.currentScore += finalScore;

        EventBus.emit(GameEvents.SCORE_CHANGED, {
            score: this.currentScore,
            addedScore: finalScore,
            baseScore: baseScore,
            multiplier: this.currentMultiplier
        });
    }

    private onMultiplierChanged(data: any): void {
        this.currentMultiplier = data.multiplier;
    }

    public update(deltaTime: number): void {}

    public getCurrentScore(): number {
        return this.currentScore;
    }

    public resetScore(): void {
        this.currentScore = 0;
        this.currentMultiplier = 1.0;
        EventBus.emit(GameEvents.SCORE_CHANGED, {
            score: this.currentScore,
            addedScore: 0,
            baseScore: 0,
            multiplier: this.currentMultiplier
        });
    }
} 