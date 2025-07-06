import { BaseSystem } from '../BaseSystem';
import { ComboComponent } from '../Components/ComboComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';
import { GameConstants } from '../../Constants/GameConstants';

export class ComboSystem extends BaseSystem {
    private comboComponent: ComboComponent;
    private lastTimeWarning: number = 0;

    constructor() {
        super();
        this.comboComponent = new ComboComponent();
    }

    public onLoad(): void {
        EventBus.on(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.on(GameEvents.FRUIT_MISSED, this.onFruitMissed.bind(this));
        EventBus.on(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
        EventBus.on(GameEvents.GAME_OVER, this.onGameOver.bind(this));
        EventBus.on(GameEvents.GAME_RESTARTED, this.onGameRestarted.bind(this));
    }

    public onDestroy(): void {
        EventBus.off(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.off(GameEvents.FRUIT_MISSED, this.onFruitMissed.bind(this));
        EventBus.off(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
        EventBus.off(GameEvents.GAME_OVER, this.onGameOver.bind(this));
        EventBus.off(GameEvents.GAME_RESTARTED, this.onGameRestarted.bind(this));
    }

    public update(deltaTime: number): void {
        if (this.comboComponent.isActive) {
            const timeLeft = this.getRemainingTime();
            
            if (timeLeft <= 1.0 && timeLeft > 0) {
                const currentTime = Date.now();
                if (currentTime - this.lastTimeWarning > 100) {
                    EventBus.emit(GameEvents.COMBO_TIME_WARNING, {
                        timeLeft: timeLeft,
                        streak: this.comboComponent.streak,
                        multiplier: this.comboComponent.multiplier,
                        isUrgent: timeLeft <= 0.5
                    });
                    this.lastTimeWarning = currentTime;
                }
            }
            
            if (this.comboComponent.isTimedOut()) {
                this.endCombo();
            }
        }
    }

    private getRemainingTime(): number {
        const currentTime = Date.now();
        const timeSinceLastCollect = (currentTime - this.comboComponent.lastCollectTime) / 1000;
        return Math.max(0, GameConstants.COMBO_TIMEOUT - timeSinceLastCollect);
    }

    private onFruitCollected(data: any): void {
        if (data.score > 0) {
            const wasActive = this.comboComponent.isActive;

            this.comboComponent.incrementStreak();

            if (!wasActive && this.comboComponent.isActive) {
                EventBus.emit(GameEvents.COMBO_STARTED, {
                    streak: this.comboComponent.streak,
                    multiplier: this.comboComponent.multiplier,
                    level: this.comboComponent.comboLevel
                });
            }

            if (this.comboComponent.isActive) {
                EventBus.emit(GameEvents.COMBO_UPDATED, {
                    streak: this.comboComponent.streak,
                    multiplier: this.comboComponent.multiplier,
                    level: this.comboComponent.comboLevel,
                    levelText: this.comboComponent.getComboLevelText()
                });
            }

            EventBus.emit(GameEvents.COMBO_MULTIPLIER_CHANGED, {
                multiplier: this.comboComponent.multiplier,
                streak: this.comboComponent.streak,
                isActive: this.comboComponent.isActive
            });
        }
    }

    private onFruitMissed(data: any): void {
        if (data.score > 0) {
            this.endCombo();
        }
    }

    private onDamageTaken(data: any): void {
        this.endCombo();
    }

    private endCombo(): void {
        if (this.comboComponent.isActive) {
            EventBus.emit(GameEvents.COMBO_ENDED, {
                finalStreak: this.comboComponent.streak,
                finalMultiplier: this.comboComponent.multiplier,
                totalCombos: this.comboComponent.totalCombos,
                maxStreak: this.comboComponent.maxStreak
            });
        }

        this.comboComponent.resetCombo();

        EventBus.emit(GameEvents.COMBO_MULTIPLIER_CHANGED, {
            multiplier: this.comboComponent.multiplier,
            streak: this.comboComponent.streak,
            isActive: this.comboComponent.isActive
        });
    }

    private onGameOver(data: any): void {}

    private onGameRestarted(data: any): void {
        this.comboComponent.resetCombo();
        this.comboComponent.totalCombos = 0;
        this.comboComponent.maxStreak = 0;
    }

    public getCurrentMultiplier(): number {
        return this.comboComponent.multiplier;
    }

    public getCurrentStreak(): number {
        return this.comboComponent.streak;
    }

    public getComboComponent(): ComboComponent {
        return this.comboComponent;
    }
} 