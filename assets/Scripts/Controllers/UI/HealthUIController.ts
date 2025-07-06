import { Component, Label, _decorator } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';
import { GameConstants } from '../../Core/Constants/GameConstants';

const { ccclass } = _decorator;

@ccclass('HealthUIController')
export class HealthUIController extends Component {
    private healthLabel: Label = null!;
    private currentHealth: number = GameConstants.BASKET_MAX_HEALTH;
    private maxHealth: number = GameConstants.BASKET_MAX_HEALTH;

    onLoad(): void {
        this.healthLabel = this.node.getComponent(Label);
        if (!this.healthLabel) {
            console.error('HealthUIController: No Label component found!');
            return;
        }

        this.updateHealthDisplay();
        
        EventBus.on(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
        EventBus.on(GameEvents.HEALTH_RESTORED, this.onHealthRestored.bind(this));
        EventBus.on(GameEvents.GAME_RESTARTED, this.onGameRestarted.bind(this));
    }

    onDestroy(): void {
        EventBus.off(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
        EventBus.off(GameEvents.HEALTH_RESTORED, this.onHealthRestored.bind(this));
        EventBus.off(GameEvents.GAME_RESTARTED, this.onGameRestarted.bind(this));
    }

    private onDamageTaken(data: any): void {
        this.currentHealth = data.currentHealth;
        this.maxHealth = data.maxHealth;
        this.updateHealthDisplay();
        
        this.node.setScale(1.2, 1.2);
        setTimeout(() => {
            this.node.setScale(1.0, 1.0);
        }, 200);
    }

    private onHealthRestored(data: any): void {
        this.currentHealth = data.currentHealth;
        this.maxHealth = data.maxHealth;
        this.updateHealthDisplay();
    }

    private onGameRestarted(): void {
        this.currentHealth = GameConstants.BASKET_MAX_HEALTH;
        this.maxHealth = GameConstants.BASKET_MAX_HEALTH;
        this.updateHealthDisplay();
    }

    private updateHealthDisplay(): void {
        if (this.healthLabel) {
            const hearts = '❤️'.repeat(this.currentHealth) + '🖤'.repeat(this.maxHealth - this.currentHealth);
            this.healthLabel.string = `${hearts}`;
        }
    }
} 