import { BaseSystem } from '../BaseSystem';
import { PositionComponent } from '../Components/PositionComponent';
import { VelocityComponent } from '../Components/VelocityComponent';
import { FallStrategyComponent } from '../Components/FallStrategyComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';
import { FallStrategyFactory } from '../../../Game/Strategies/FallStrategyFactory';

export class MovementSystem extends BaseSystem {
    
    public update(deltaTime: number): void {
        const entities = this.world.getEntitiesWith(['PositionComponent', 'VelocityComponent']);
        
        entities.forEach(entityId => {
            const position = this.world.getComponent<PositionComponent>(entityId, 'PositionComponent');
            const velocity = this.world.getComponent<VelocityComponent>(entityId, 'VelocityComponent');
            
            if (position && velocity) {
                if (this.world.hasComponent(entityId, 'FallStrategyComponent')) {
                    this.applyFallStrategy(entityId, position, velocity, deltaTime);
                }
                
                position.addPosition(velocity.x * deltaTime, velocity.y * deltaTime);

                let eventName = GameEvents.POSITION_CHANGED;
                
                if (this.world.hasComponent(entityId, 'BasketComponent')) {
                    eventName = GameEvents.BASKET_POSITION_CHANGED;
                } else if (this.world.hasComponent(entityId, 'FruitComponent')) {
                    eventName = GameEvents.FRUIT_POSITION_CHANGED;
                }

                EventBus.emit(eventName, {
                    entityId,
                    x: position.x,
                    y: position.y
                });
            }
        });
    }

    private applyFallStrategy(entityId: number, position: PositionComponent, velocity: VelocityComponent, deltaTime: number): void {
        const fallStrategyComponent = this.world.getComponent<FallStrategyComponent>(entityId, 'FallStrategyComponent');
        
        if (fallStrategyComponent) {
            const strategy = FallStrategyFactory.createStrategy(fallStrategyComponent.strategyType);
            strategy.applyStrategy(velocity, position, deltaTime, fallStrategyComponent.parameters);
        }
    }
} 