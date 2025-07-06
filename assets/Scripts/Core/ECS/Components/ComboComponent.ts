import { BaseComponent } from '../BaseComponent';
import { GameConstants } from '../../Constants/GameConstants';

export class ComboComponent extends BaseComponent {
    public streak: number = 0;
    public multiplier: number = 1.0;
    public lastCollectTime: number = 0;
    public isActive: boolean = false;
    public comboLevel: number = 0;
    public totalCombos: number = 0;
    public maxStreak: number = 0;

    constructor() {
        super();
    }

    public incrementStreak(): void {
        this.streak++;
        this.lastCollectTime = Date.now();
        
        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
        }

        if (this.streak >= GameConstants.COMBO_MIN_STREAK && !this.isActive) {
            this.isActive = true;
            this.totalCombos++;
        }

        this.updateMultiplier();
    }

    public resetCombo(): void {
        this.streak = 0;
        this.multiplier = GameConstants.COMBO_MULTIPLIER_BASE;
        this.isActive = false;
        this.comboLevel = 0;
    }

    public isTimedOut(): boolean {
        const currentTime = Date.now();
        const timeSinceLastCollect = (currentTime - this.lastCollectTime) / 1000;
        return timeSinceLastCollect > GameConstants.COMBO_TIMEOUT;
    }

    private updateMultiplier(): void {        
        this.comboLevel = 0;
        for (let i = 0; i < GameConstants.COMBO_LEVELS.length; i++) {
            if (this.streak >= GameConstants.COMBO_LEVELS[i]) {
                this.comboLevel = i + 1;
            }
        }

        this.multiplier = Math.min(
            GameConstants.COMBO_MULTIPLIER_BASE + (this.comboLevel * GameConstants.COMBO_MULTIPLIER_INCREMENT),
            GameConstants.COMBO_MULTIPLIER_MAX
        );
    }

    public getComboLevelText(): string {
        switch (this.comboLevel) {
            case 0: return '';
            case 1: return 'Хорошо!';
            case 2: return 'Отлично!';
            case 3: return 'Потрясающе!';
            case 4: return 'Невероятно!';
            case 5: return 'ЛЕГЕНДА!';
            default: return 'МАСТЕР!';
        }
    }
} 