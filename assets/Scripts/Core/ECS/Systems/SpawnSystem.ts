import { ScreenAwareSystem } from './ScreenAwareSystem';
import { FruitType } from '../Components/FruitComponent';
import { CollectibleFactory } from '../../../Game/Entities/CollectibleFactory';
import { GameConstants } from '../../Constants/GameConstants';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class SpawnSystem extends ScreenAwareSystem {
    private spawnTimer: number = 0;
    private spawnRate: number = GameConstants.FRUIT_SPAWN_RATE;

    public update(deltaTime: number): void {
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnItem();
            this.spawnTimer = 0;
        }
    }

    private spawnItem(): void {
        const randomX = Math.random() * (this.screenWidth - GameConstants.FRUIT_SIZE.width * 2) + GameConstants.FRUIT_SIZE.width / 2;
        const spawnY = this.screenHeight + GameConstants.FRUIT_SIZE.height * 2;
        
        let randomType: FruitType;
        if (Math.random() < 0.25) {
            randomType = FruitType.MUSHROOM;
        } else {
            const fruitTypes = [FruitType.APPLE, FruitType.BANANA, FruitType.ORANGE];
            randomType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        }
        
        const entity = CollectibleFactory.createFruit(this.world, randomType, randomX, spawnY);
        EventBus.emit(GameEvents.FRUIT_SPAWNED, {
            entityId: entity,
            fruitType: randomType,
            isHazard: randomType === FruitType.MUSHROOM,
            x: randomX,
            y: spawnY
        });
    }
} 