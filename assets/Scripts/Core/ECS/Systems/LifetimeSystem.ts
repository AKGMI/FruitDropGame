import { BaseSystem } from '../BaseSystem';
import { LifetimeComponent } from '../Components/LifetimeComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class LifetimeSystem extends BaseSystem {
    
    public update(deltaTime: number): void {
        const entities = this.world.getEntitiesWith(['LifetimeComponent']);
        const entitiesToDestroy: number[] = [];
        
        entities.forEach(entityId => {
            const lifetime = this.world.getComponent<LifetimeComponent>(entityId, 'LifetimeComponent');
            
            if (lifetime) {
                lifetime.update(deltaTime);
                
                if (lifetime.isExpired()) {
                    entitiesToDestroy.push(entityId);
                }
            }
        });
        
        entitiesToDestroy.forEach(entityId => {
            if (this.world.hasEntity(entityId)) {
                EventBus.emit(GameEvents.ENTITY_DESTROYED, { entityId });
                this.world.destroyEntity(entityId);
            }
        });
    }
} 