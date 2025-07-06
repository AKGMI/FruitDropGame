import { ScreenAwareSystem } from './ScreenAwareSystem';
import { PositionComponent } from '../Components/PositionComponent';
import { BoundsComponent } from '../Components/BoundsComponent';
import { FruitComponent } from '../Components/FruitComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class BoundarySystem extends ScreenAwareSystem {

    public update(deltaTime: number): void {
        this.checkBasketBounds();
        this.checkFruitBounds();
    }

    private checkBasketBounds(): void {
        const basketEntities = this.world.getEntitiesWith(['BasketComponent', 'PositionComponent', 'BoundsComponent']);
        
        basketEntities.forEach(entityId => {
            const position = this.world.getComponent(entityId, 'PositionComponent') as PositionComponent;
            const bounds = this.world.getComponent(entityId, 'BoundsComponent') as BoundsComponent;
            
            if (position && bounds) {
                const halfWidth = bounds.width / 2;
                
                if (position.x - halfWidth < 0) {
                    position.x = halfWidth;
                } else if (position.x + halfWidth > this.screenWidth) {
                    position.x = this.screenWidth - halfWidth;
                }
            }
        });
    }

    private checkFruitBounds(): void {
        const fruitEntities = this.world.getEntitiesWith(['FruitComponent', 'PositionComponent', 'BoundsComponent']);
        const entitiesToDestroy: number[] = [];
        
        fruitEntities.forEach(entityId => {
            const position = this.world.getComponent(entityId, 'PositionComponent') as PositionComponent;
            const bounds = this.world.getComponent(entityId, 'BoundsComponent') as BoundsComponent;
            const fruit = this.world.getComponent(entityId, 'FruitComponent') as FruitComponent;
            
            if (position && bounds) {
                if (position.y + bounds.height / 2 < -bounds.height) {
                    entitiesToDestroy.push(entityId);
                    
                    EventBus.emit(GameEvents.FRUIT_MISSED, {
                        entityId,
                        score: fruit.score,
                        position: { x: position.x, y: position.y }
                    });
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