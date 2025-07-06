import { Component, Label, Button, Node, _decorator } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { ServiceLocator } from '../../Core/ServiceLocator/ServiceLocator';
import { GameManager } from '../../Game/GameManager';
import { GameEvents } from '../../Core/Constants/GameEvents';
import { AudioSystem } from '../../Core/ECS/Systems/AudioSystem';

const { ccclass, property } = _decorator;

@ccclass('GameOverUIController')
export class GameOverUIController extends Component {
    @property(Label)
    finalScoreLabel: Label = null!;
    
    @property(Button)
    restartButton: Button = null!;

    private finalScore: number = 0;

    onLoad(): void {
        EventBus.on(GameEvents.GAME_OVER, this.onGameOver.bind(this));
        this.hideGameOverPanel();
        this.setupButtons();
    }

    onDestroy(): void {
        EventBus.off(GameEvents.GAME_OVER, this.onGameOver.bind(this));
        this.removeButtonListeners();
    }

    private setupButtons(): void {
        if (this.restartButton) {
            this.restartButton.node.on(Button.EventType.CLICK, this.onRestartClicked, this);
        }
    }

    private removeButtonListeners(): void {
        if (this.restartButton) {
            this.restartButton.node.off(Button.EventType.CLICK, this.onRestartClicked, this);
        }
    }

    private onGameOver(data: any): void {
        this.finalScore = data.finalScore;
        this.showGameOverPanel();
        this.updateFinalScoreDisplay();
    }

    private showGameOverPanel(): void {
        this.node.active = true;
    }

    private hideGameOverPanel(): void {
        this.node.active = false;
    }

    private updateFinalScoreDisplay(): void {
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = `${this.finalScore}`;
        }
    }

    private onRestartClicked(): void {
        const audioSystem = ServiceLocator.get<AudioSystem>('AudioSystem');
        if (audioSystem) {
            audioSystem.playButtonClick();
        }
        
        this.hideGameOverPanel();
        
        const gameManager = ServiceLocator.get<GameManager>('GameManager');
        if (gameManager) {
            gameManager.restartGame();
        }
    }

    public getFinalScore(): number {
        return this.finalScore;
    }
} 