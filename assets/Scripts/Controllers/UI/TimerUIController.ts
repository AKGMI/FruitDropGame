import { Component, Label, _decorator } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('TimerUIController')
export class TimerUIController extends Component {
    private currentTime: number = 0;
    private maxTime: number = 60;

    onLoad(): void {
        EventBus.on(GameEvents.TIMER_UPDATED, this.onTimerUpdated.bind(this));
        EventBus.on(GameEvents.GAME_STARTED, this.onGameStarted.bind(this));
        this.updateTimerDisplay();
    }

    onDestroy(): void {
        EventBus.off(GameEvents.TIMER_UPDATED, this.onTimerUpdated.bind(this));
        EventBus.off(GameEvents.GAME_STARTED, this.onGameStarted.bind(this));
    }

    private onGameStarted(data: any): void {
        this.maxTime = data.gameTime;
        this.currentTime = data.gameTime;
        this.updateTimerDisplay();
    }

    private onTimerUpdated(data: any): void {
        this.currentTime = data.currentTime;
        this.maxTime = data.maxTime;
        this.updateTimerDisplay();
    }

    private updateTimerDisplay(): void {
        const timerLabel = this.node.getComponent(Label);
        if (timerLabel) {
            const minutes = Math.floor((this.currentTime + 1) / 60);
            const seconds = Math.floor((this.currentTime + 1) % 60);
            const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
            const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
            timerLabel.string = `${minutesStr}:${secondsStr}`;
        }
    }

    public getCurrentTime(): number {
        return this.currentTime;
    }

    public getProgress(): number {
        return this.maxTime > 0 ? this.currentTime / this.maxTime : 0;
    }
} 