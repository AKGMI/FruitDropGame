import { ECSWorld } from '../../Core/ECS/ECSWorld';
import { PositionComponent } from '../../Core/ECS/Components/PositionComponent';
import { VelocityComponent } from '../../Core/ECS/Components/VelocityComponent';
import { BoundsComponent } from '../../Core/ECS/Components/BoundsComponent';
import { RotationComponent } from '../../Core/ECS/Components/RotationComponent';
import { FruitComponent, FruitType } from '../../Core/ECS/Components/FruitComponent';
import { CollectibleComponent } from '../../Core/ECS/Components/CollectibleComponent';
import { LifetimeComponent } from '../../Core/ECS/Components/LifetimeComponent';
import { FallStrategyComponent, FallStrategyType } from '../../Core/ECS/Components/FallStrategyComponent';
import { GameConstants } from '../../Core/Constants/GameConstants';

export class CollectibleFactory {
    public static createFruit(world: ECSWorld, type: FruitType, x: number, y: number): number {
        const entity = world.createEntity();
        
        const baseSpeed = GameConstants.FRUIT_FALL_SPEED;
        const variation = GameConstants.FRUIT_SPEED_VARIATION;
        const randomSpeed = baseSpeed + (Math.random() - 0.5) * 2 * variation;
        
        const rotationMultiplier = (type === FruitType.MUSHROOM) ? 0.5 : 1.0;
        const minRotSpeed = GameConstants.FRUIT_ROTATION_SPEED_MIN * rotationMultiplier;
        const maxRotSpeed = GameConstants.FRUIT_ROTATION_SPEED_MAX * rotationMultiplier;
        const randomRotationSpeed = Math.random() * (maxRotSpeed - minRotSpeed) + minRotSpeed;
        
        const fallStrategies = [FallStrategyType.STRAIGHT, FallStrategyType.ZIGZAG, FallStrategyType.ACCELERATED];
        const randomStrategy = fallStrategies[Math.floor(Math.random() * fallStrategies.length)];
        
        const size = GameConstants.FRUIT_SIZE;
        
        world.addComponent(entity, new PositionComponent(x, y));
        world.addComponent(entity, new VelocityComponent(0, -randomSpeed));
        world.addComponent(entity, new BoundsComponent(size.width, size.height));
        world.addComponent(entity, new RotationComponent(randomRotationSpeed));
        world.addComponent(entity, new FruitComponent(type));
        world.addComponent(entity, new CollectibleComponent());
        world.addComponent(entity, new LifetimeComponent(GameConstants.FRUIT_LIFETIME));
        world.addComponent(entity, new FallStrategyComponent(randomStrategy));
        
        return entity;
    }
} 