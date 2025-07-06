import { Component, Label, _decorator } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('ScoreUIController')
export class ScoreUIController extends Component {
    private currentScore: number = 0;

    onLoad(): void {
        EventBus.on(GameEvents.SCORE_CHANGED, this.onScoreChanged.bind(this));
        this.updateScoreDisplay();
    }

    onDestroy(): void {
        EventBus.off(GameEvents.SCORE_CHANGED, this.onScoreChanged.bind(this));
    }

    private onScoreChanged(data: any): void {
        this.currentScore = data.score;
        this.updateScoreDisplay();
    }

    private updateScoreDisplay(): void {
        const scoreLabel = this.node.getComponent(Label);
        if (scoreLabel) {
            scoreLabel.string = `Счёт: ${this.currentScore}`;
        }
    }

    public getCurrentScore(): number {
        return this.currentScore;
    }
} 