import { BaseSystem } from '../BaseSystem';
import { RotationComponent } from '../Components/RotationComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class RotationSystem extends BaseSystem {
    
    public update(deltaTime: number): void {
        const entities = this.world.getEntitiesWith(['RotationComponent']);
        
        entities.forEach(entityId => {
            if (!this.world.hasEntity(entityId)) return;
            
            const rotation = this.world.getComponent<RotationComponent>(entityId, 'RotationComponent');
            
            if (rotation && rotation.rotationSpeed !== 0) {
                const deltaRotation = rotation.rotationSpeed * deltaTime;
                rotation.addRotation(deltaRotation);
                
                if (this.world.hasComponent(entityId, 'FruitComponent')) {
                    EventBus.emit(GameEvents.FRUIT_ROTATION_CHANGED, {
                        entityId,
                        rotation: rotation.rotation
                    });
                }
            }
        });
    }
} 