import { BaseSystem } from '../BaseSystem';
import { HealthComponent } from '../Components/HealthComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';
import { ServiceLocator } from '../../ServiceLocator/ServiceLocator';

export class HealthSystem extends BaseSystem {
    public update(deltaTime: number): void {
        const entities = this.world.getEntitiesWith(['HealthComponent']);
        
        entities.forEach(entityId => {
            if (!this.world.hasEntity(entityId)) return;
            
            const health = this.world.getComponent<HealthComponent>(entityId, 'HealthComponent');
            if (health) {
                health.updateInvulnerability(deltaTime);
                
                if (health.isDead()) {
                    this.handleEntityDeath(entityId);
                }
            }
        });
    }

    private handleEntityDeath(entityId: number): void {       
        if (this.world.hasComponent(entityId, 'BasketComponent')) {
            const gameManager = ServiceLocator.get('GameManager') as any;
            if (gameManager && gameManager.endGame) {
                gameManager.endGame();
            }
        }
    }

    public damageEntity(entityId: number, damage: number): boolean {
        if (!this.world.hasEntity(entityId)) return false;
        
        const health = this.world.getComponent<HealthComponent>(entityId, 'HealthComponent');
        if (health) {
            const damageTaken = health.takeDamage(damage);
            
            if (damageTaken) {
                EventBus.emit(GameEvents.DAMAGE_TAKEN, {
                    entityId: entityId,
                    damage: damage,
                    currentHealth: health.currentHealth,
                    maxHealth: health.maxHealth
                });
                
                return true;
            }
        }
        
        return false;
    }

    public healEntity(entityId: number, amount: number): boolean {
        if (!this.world.hasEntity(entityId)) return false;
        
        const health = this.world.getComponent<HealthComponent>(entityId, 'HealthComponent');
        if (health) {
            const oldHealth = health.currentHealth;
            health.heal(amount);
            
            if (health.currentHealth > oldHealth) {
                EventBus.emit(GameEvents.HEALTH_RESTORED, {
                    entityId: entityId,
                    amount: amount,
                    currentHealth: health.currentHealth,
                    maxHealth: health.maxHealth
                });
                
                return true;
            }
        }
        
        return false;
    }
} 