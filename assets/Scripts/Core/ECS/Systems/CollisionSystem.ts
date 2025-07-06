import { BaseSystem } from '../BaseSystem';
import { PositionComponent } from '../Components/PositionComponent';
import { BoundsComponent } from '../Components/BoundsComponent';
import { FruitComponent } from '../Components/FruitComponent';
import { HealthComponent } from '../Components/HealthComponent';
import { CollectibleComponent } from '../Components/CollectibleComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';
import { ServiceLocator } from '../../ServiceLocator/ServiceLocator';
import { HealthSystem } from './HealthSystem';

export class CollisionSystem extends BaseSystem {
    
    public update(deltaTime: number): void {
        const basketEntities = this.world.getEntitiesWith(['BasketComponent', 'PositionComponent', 'BoundsComponent']);
        const fruitEntities = this.world.getEntitiesWith(['FruitComponent', 'PositionComponent', 'BoundsComponent', 'CollectibleComponent']);
        
        basketEntities.forEach(basketId => {
            const basketPos = this.world.getComponent(basketId, 'PositionComponent') as PositionComponent;
            const basketBounds = this.world.getComponent(basketId, 'BoundsComponent') as BoundsComponent;
            
            if (!basketPos || !basketBounds) return;
            
            fruitEntities.forEach(fruitId => {
                if (!this.world.hasEntity(fruitId)) return;
                
                const fruitPos = this.world.getComponent(fruitId, 'PositionComponent') as PositionComponent;
                const fruitBounds = this.world.getComponent(fruitId, 'BoundsComponent') as BoundsComponent;
                const collectible = this.world.getComponent(fruitId, 'CollectibleComponent') as CollectibleComponent;
                
                if (!fruitPos || !fruitBounds || !collectible || collectible.collected) return;
                
                if (this.checkCollision(basketPos, basketBounds, fruitPos, fruitBounds)) {
                    this.handleFruitCollision(basketId, fruitId);
                }
            });
        });
    }
    
    private checkCollision(
        pos1: PositionComponent, bounds1: BoundsComponent,
        pos2: PositionComponent, bounds2: BoundsComponent
    ): boolean {
        const left1 = pos1.x - bounds1.width / 2;
        const right1 = pos1.x + bounds1.width / 2;
        const top1 = pos1.y - bounds1.height / 2;
        const bottom1 = pos1.y + bounds1.height / 2;
        
        const left2 = pos2.x - bounds2.width / 2;
        const right2 = pos2.x + bounds2.width / 2;
        const top2 = pos2.y - bounds2.height / 2;
        const bottom2 = pos2.y + bounds2.height / 2;
        
        return !(left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2);
    }

    private handleFruitCollision(basketId: number, fruitId: number): void {
        if (!this.world.hasEntity(fruitId)) return;
        
        const collectible = this.world.getComponent(fruitId, 'CollectibleComponent') as CollectibleComponent;
        const fruitComponent = this.world.getComponent(fruitId, 'FruitComponent') as FruitComponent;
        
        if (collectible && fruitComponent && !collectible.collected) {
            collectible.collected = true;
            
            if (fruitComponent.isHazard()) {
                this.handleHazardTouch(basketId, fruitId, fruitComponent);
            } else {
                this.handleFruitCollection(basketId, fruitId, fruitComponent);
            }
        }
    }

    private handleFruitCollection(basketId: number, fruitId: number, fruitComponent: FruitComponent): void {
        const fruitPos = this.world.getComponent(fruitId, 'PositionComponent') as PositionComponent;
        
        EventBus.emit(GameEvents.FRUIT_COLLECTED, {
            basketId,
            entityId: fruitId,
            fruitType: fruitComponent.type,
            score: fruitComponent.score,
            position: fruitPos ? { x: fruitPos.x, y: fruitPos.y } : { x: 0, y: 0 }
        });
        
        setTimeout(() => {
            if (this.world.hasEntity(fruitId)) {
                EventBus.emit(GameEvents.ENTITY_DESTROYED, { entityId: fruitId });
                this.world.destroyEntity(fruitId);
            }
        }, 400);
    }

    private handleHazardTouch(basketId: number, fruitId: number, fruitComponent: FruitComponent): void {
        const basketHealth = this.world.getComponent(basketId, 'HealthComponent') as HealthComponent;
        
        if (basketHealth) {
            if (basketHealth.isInvulnerable()) {
                return;
            }

            const healthSystem = ServiceLocator.get<HealthSystem>('HealthSystem');
            if (healthSystem && healthSystem.damageEntity) {
                healthSystem.damageEntity(basketId, fruitComponent.getDamage());
            }
            
            EventBus.emit(GameEvents.HAZARD_COLLISION, {
                basketId,
                entityId: fruitId,
                fruitType: fruitComponent.type,
                damage: fruitComponent.getDamage()
            });
        }
        
        setTimeout(() => {
            if (this.world.hasEntity(fruitId)) {
                EventBus.emit(GameEvents.ENTITY_DESTROYED, { entityId: fruitId });
                this.world.destroyEntity(fruitId);
            }
        }, 350);
    }
} 