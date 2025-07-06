import { Component, _decorator, view } from 'cc';
import { ECSWorld } from '../Core/ECS/ECSWorld';
import { MovementSystem } from '../Core/ECS/Systems/MovementSystem';
import { InputSystem } from '../Core/ECS/Systems/InputSystem';
import { CollisionSystem } from '../Core/ECS/Systems/CollisionSystem';
import { SpawnSystem } from '../Core/ECS/Systems/SpawnSystem';
import { ScoreSystem } from '../Core/ECS/Systems/ScoreSystem';
import { LifetimeSystem } from '../Core/ECS/Systems/LifetimeSystem';
import { BoundarySystem } from '../Core/ECS/Systems/BoundarySystem';
import { RotationSystem } from '../Core/ECS/Systems/RotationSystem';
import { HealthSystem } from '../Core/ECS/Systems/HealthSystem';
import { ComboSystem } from '../Core/ECS/Systems/ComboSystem';
import { AnimationSystem } from '../Core/ECS/Systems/AnimationSystem';
import { EffectSystem } from '../Core/ECS/Systems/EffectSystem';
import { AudioSystem } from '../Core/ECS/Systems/AudioSystem';
import { PositionComponent } from '../Core/ECS/Components/PositionComponent';
import { VelocityComponent } from '../Core/ECS/Components/VelocityComponent';
import { BoundsComponent } from '../Core/ECS/Components/BoundsComponent';
import { BasketComponent } from '../Core/ECS/Components/BasketComponent';
import { HealthComponent } from '../Core/ECS/Components/HealthComponent';
import { ServiceLocator } from '../Core/ServiceLocator/ServiceLocator';
import { EventBus } from '../Core/EventBus/EventBus';
import { GameConstants } from '../Core/Constants/GameConstants';
import { GameEvents } from '../Core/Constants/GameEvents';

const { ccclass } = _decorator;

export enum GameState {
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over'
}

@ccclass('GameManager')
export class GameManager extends Component {
    private ecsWorld: ECSWorld;
    private scoreSystem: ScoreSystem;
    private healthSystem: HealthSystem;
    private audioSystem: AudioSystem;
    private gameState: GameState = GameState.PLAYING;
    private gameTime: number = GameConstants.GAME_TIME;
    private currentTime: number = 0;

    onLoad(): void {
        this.initializeECS();
        this.registerServices();
        this.createBasketEntity();
    }

    private initializeECS(): void {
        this.ecsWorld = ECSWorld.getInstance();
        
        const screenSize = view.getVisibleSize();
        
        this.ecsWorld.addSystem(new MovementSystem());
        this.ecsWorld.addSystem(new RotationSystem());
        this.ecsWorld.addSystem(new InputSystem());
        this.ecsWorld.addSystem(new CollisionSystem());
        
        const spawnSystem = new SpawnSystem();
        spawnSystem.setScreenDimensions(screenSize.width, screenSize.height);
        this.ecsWorld.addSystem(spawnSystem);
        
        this.scoreSystem = new ScoreSystem();
        this.ecsWorld.addSystem(this.scoreSystem);
        this.ecsWorld.addSystem(new LifetimeSystem());
        
        const boundarySystem = new BoundarySystem();
        boundarySystem.setScreenDimensions(screenSize.width, screenSize.height);
        this.ecsWorld.addSystem(boundarySystem);

        this.healthSystem = new HealthSystem();
        this.ecsWorld.addSystem(this.healthSystem);
        this.ecsWorld.addSystem(new ComboSystem());
        this.ecsWorld.addSystem(new AnimationSystem());
        this.ecsWorld.addSystem(new EffectSystem());
        
        this.audioSystem = new AudioSystem();
        this.ecsWorld.addSystem(this.audioSystem);
    }

    private registerServices(): void {
        ServiceLocator.register('GameManager', this);
        ServiceLocator.register('ECSWorld', this.ecsWorld);
        ServiceLocator.register('ScoreSystem', this.scoreSystem);
        ServiceLocator.register('HealthSystem', this.healthSystem);
        ServiceLocator.register('AudioSystem', this.audioSystem);
    }

    private createBasketEntity(): void {
        const screenSize = view.getVisibleSize();
        const basketEntity = this.ecsWorld.createEntity();
        
        this.ecsWorld.addComponent(basketEntity, new PositionComponent(screenSize.width / 2, GameConstants.BASKET_Y_POSITION));
        this.ecsWorld.addComponent(basketEntity, new VelocityComponent(0, 0));
        this.ecsWorld.addComponent(basketEntity, new BoundsComponent(GameConstants.BASKET_SIZE.width, GameConstants.BASKET_SIZE.height));
        this.ecsWorld.addComponent(basketEntity, new BasketComponent(GameConstants.BASKET_SPEED, GameConstants.BASKET_SIZE.width));
        this.ecsWorld.addComponent(basketEntity, new HealthComponent(GameConstants.BASKET_MAX_HEALTH));

        EventBus.emit(GameEvents.BASKET_CREATED, {
            entityId: basketEntity,
            x: screenSize.width / 2,
            y: GameConstants.BASKET_Y_POSITION
        });
    }

    public startGame(): void {
        this.gameState = GameState.PLAYING;
        this.currentTime = this.gameTime;
        
        EventBus.emit(GameEvents.GAME_STARTED, {
            gameTime: this.gameTime
        });
    }

    public restartGame(): void {
        this.clearFruits();
        this.resetBasketPosition();
        this.resetBasketHealth();
        
        if (this.scoreSystem) {
            this.scoreSystem.resetScore();
        }
        
        this.startGame();
        
        EventBus.emit(GameEvents.GAME_RESTARTED);
    }

    private clearFruits(): void {
        const fruitEntities = this.ecsWorld.getEntitiesWith(['FruitComponent']);
        
        fruitEntities.forEach(entityId => {
            if (this.ecsWorld.hasEntity(entityId)) {
                EventBus.emit(GameEvents.ENTITY_DESTROYED, { entityId });
                this.ecsWorld.destroyEntity(entityId);
            }
        });
    }

    private resetBasketPosition(): void {
        const basketEntities = this.ecsWorld.getEntitiesWith(['BasketComponent', 'PositionComponent']);
        
        basketEntities.forEach(entityId => {
            const position = this.ecsWorld.getComponent(entityId, 'PositionComponent') as PositionComponent;
            if (position) {
                position.x = 0;
                position.y = GameConstants.BASKET_Y_POSITION;
            }
        });
    }

    private resetBasketHealth(): void {
        const basketEntities = this.ecsWorld.getEntitiesWith(['BasketComponent', 'HealthComponent']);
        
        basketEntities.forEach(entityId => {
            const health = this.ecsWorld.getComponent(entityId, 'HealthComponent') as HealthComponent;
            if (health) {
                health.currentHealth = health.maxHealth;
            }
        });
    }

    public pauseGame(): void {
        if (this.gameState === GameState.PLAYING) {
            this.gameState = GameState.PAUSED;
            EventBus.emit(GameEvents.GAME_PAUSED);
        }
    }

    public resumeGame(): void {
        if (this.gameState === GameState.PAUSED) {
            this.gameState = GameState.PLAYING;
            EventBus.emit(GameEvents.GAME_RESUMED);
        }
    }

    public endGame(): void {      
        const finalScore = this.scoreSystem ? this.scoreSystem.getCurrentScore() : 0;
        
        EventBus.emit(GameEvents.GAME_OVER, {
            finalScore
        });

        this.gameState = GameState.GAME_OVER;
    }

    update(deltaTime: number): void {
        if (this.gameState === GameState.PLAYING) {
            this.ecsWorld.update(deltaTime);
            this.updateGameTimer(deltaTime);
        } else if (this.gameState === GameState.GAME_OVER) {
            if (this.audioSystem) {
                this.audioSystem.update(deltaTime);
            }
        }
    }

    private updateGameTimer(deltaTime: number): void {
        this.currentTime -= deltaTime;
        
        EventBus.emit(GameEvents.TIMER_UPDATED, {
            currentTime: this.currentTime,
            maxTime: this.gameTime
        });
        
        if (this.currentTime <= 0) {
            this.endGame();
        }
    }

    public getGameState(): GameState {
        return this.gameState;
    }

    public getCurrentTime(): number {
        return this.currentTime;
    }

    public getScore(): number {
        return this.scoreSystem ? this.scoreSystem.getCurrentScore() : 0;
    }

    public isRunning(): boolean {
        return this.gameState === GameState.PLAYING;
    }

    public getECSWorld(): ECSWorld {
        return this.ecsWorld;
    }
} 