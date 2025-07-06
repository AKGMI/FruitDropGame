import { BaseComponent } from '../BaseComponent';
import { GameConstants } from '../../Constants/GameConstants';

export class HealthComponent extends BaseComponent {
    public static readonly componentName = 'HealthComponent';
    
    public currentHealth: number;
    public maxHealth: number;
    public invulnerabilityTime: number = 0;
    public invulnerabilityDuration: number = GameConstants.INVULNERABILITY_DURATION;

    constructor(maxHealth: number = GameConstants.BASKET_MAX_HEALTH) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }

    public takeDamage(damage: number): boolean {
        if (this.invulnerabilityTime > 0) {
            return false;
        }

        this.currentHealth -= damage;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }

        this.invulnerabilityTime = this.invulnerabilityDuration;

        return true;
    }

    public heal(amount: number): void {
        this.currentHealth += amount;
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }

    public isDead(): boolean {
        return this.currentHealth <= 0;
    }

    public isInvulnerable(): boolean {
        return this.invulnerabilityTime > 0;
    }

    public updateInvulnerability(deltaTime: number): void {
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime < 0) {
                this.invulnerabilityTime = 0;
            }
        }
    }
} 