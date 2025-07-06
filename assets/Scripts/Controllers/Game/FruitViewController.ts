import { Component, Node, Prefab, SpriteFrame, Sprite, UITransform, instantiate, _decorator, Color, UIOpacity, tween, Vec3 } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { FruitType } from '../../Core/ECS/Components/FruitComponent';
import { GameEvents } from '../../Core/Constants/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('FruitViewController')
export class FruitViewController extends Component {
    @property(Prefab)
    fruitPrefab: Prefab = null!;
    
    @property(SpriteFrame)
    appleSprite: SpriteFrame = null!;
    
    @property(SpriteFrame)
    bananaSprite: SpriteFrame = null!;
    
    @property(SpriteFrame)
    orangeSprite: SpriteFrame = null!;

    @property(SpriteFrame)
    mushroomSprite: SpriteFrame = null!;

    private fruitNodes: Map<number, Node> = new Map();

    onLoad(): void {
        EventBus.on(GameEvents.FRUIT_SPAWNED, this.onFruitSpawned.bind(this));
        EventBus.on(GameEvents.FRUIT_POSITION_CHANGED, this.onPositionChanged.bind(this));
        EventBus.on(GameEvents.FRUIT_ROTATION_CHANGED, this.onRotationChanged.bind(this));
        EventBus.on(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.on(GameEvents.HAZARD_COLLISION, this.onHazardCollision.bind(this));
        EventBus.on(GameEvents.ENTITY_DESTROYED, this.onEntityDestroyed.bind(this));
        EventBus.on(GameEvents.ANIMATION_CHANGED, this.onAnimationChanged.bind(this));
    }

    onDestroy(): void {
        EventBus.off(GameEvents.FRUIT_SPAWNED, this.onFruitSpawned.bind(this));
        EventBus.off(GameEvents.FRUIT_POSITION_CHANGED, this.onPositionChanged.bind(this));
        EventBus.off(GameEvents.FRUIT_ROTATION_CHANGED, this.onRotationChanged.bind(this));
        EventBus.off(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.off(GameEvents.HAZARD_COLLISION, this.onHazardCollision.bind(this));
        EventBus.off(GameEvents.ENTITY_DESTROYED, this.onEntityDestroyed.bind(this));
        EventBus.off(GameEvents.ANIMATION_CHANGED, this.onAnimationChanged.bind(this));
    }

    private onFruitSpawned(data: any): void {
        if (!this.fruitPrefab) {
            console.error('Fruit prefab not assigned!');
            return;
        }

        const fruitNode = instantiate(this.fruitPrefab);
        const sprite = fruitNode.getComponent(Sprite);
        const transform = fruitNode.getComponent(UITransform);
        
        if (!sprite) {
            console.error('Fruit prefab must have Sprite component!');
            return;
        }

        if (!transform) {
            console.error('Fruit prefab must have UITransform component!');
            return;
        }

        let opacity = fruitNode.getComponent(UIOpacity);
        if (!opacity) {
            opacity = fruitNode.addComponent(UIOpacity);
        }

        const spriteFrame = this.getSpriteForFruit(data.fruitType);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }

        transform.setContentSize(spriteFrame.width * 0.2, spriteFrame.height * 0.2);

        fruitNode.setPosition(data.x, data.y);
        this.node.addChild(fruitNode);
        this.fruitNodes.set(data.entityId, fruitNode);
    }

    private onPositionChanged(data: any): void {
        const fruitNode = this.fruitNodes.get(data.entityId);
        if (fruitNode) {
            fruitNode.setPosition(data.x, data.y);
        }
    }

    private onRotationChanged(data: any): void {
        const fruitNode = this.fruitNodes.get(data.entityId);
        if (fruitNode) {
            fruitNode.setRotationFromEuler(0, 0, -data.rotation);
        }
    }

    private onAnimationChanged(data: any): void {
        const fruitNode = this.fruitNodes.get(data.entityId);
        if (!fruitNode) return;

        if (data.scaleX !== undefined && data.scaleY !== undefined) {
            fruitNode.setScale(data.scaleX, data.scaleY);
        }

        if (data.alpha !== undefined) {
            const opacity = fruitNode.getComponent(UIOpacity);
            if (opacity) {
                opacity.opacity = Math.floor(data.alpha * 255);
            }
        }

        if (data.colorR !== undefined && data.colorG !== undefined && data.colorB !== undefined) {
            const sprite = fruitNode.getComponent(Sprite);
            if (sprite) {
                const color = new Color(
                    Math.floor(data.colorR * 255),
                    Math.floor(data.colorG * 255),
                    Math.floor(data.colorB * 255),
                    sprite.color.a
                );
                sprite.color = color;
            }
        }
    }

    private onFruitCollected(data: any): void {
        const fruitNode = this.fruitNodes.get(data.entityId);
        if (fruitNode) {
            tween(fruitNode)
                .to(0.1, { 
                    scale: new Vec3(1.3, 1.3, 1) 
                })
                .to(0.25, {
                    scale: new Vec3(0, 0, 1) 
                })
                .call(() => {
                    if (fruitNode.parent) {
                        fruitNode.removeFromParent();
                    }
                    this.fruitNodes.delete(data.entityId);
                })
                .start();

            tween(fruitNode)
                .to(0.35, { 
                    eulerAngles: new Vec3(0, 0, fruitNode.eulerAngles.z + 180) 
                })
                .start();
        }
    }

    private onHazardCollision(data: any): void {
        const fruitNode = this.fruitNodes.get(data.entityId);
        if (fruitNode) {
            tween(fruitNode)
                .to(0.1, { 
                    scale: new Vec3(1.5, 1.5, 1) 
                })
                .to(0.2, { 
                    scale: new Vec3(0.3, 0.3, 1) 
                })
                .call(() => {
                    if (fruitNode.parent) {
                        fruitNode.removeFromParent();
                    }
                    this.fruitNodes.delete(data.entityId);
                })
                .start();

            tween(fruitNode)
                .to(0.3, { 
                    eulerAngles: new Vec3(0, 0, fruitNode.eulerAngles.z + 360) 
                })
                .start();

            const sprite = fruitNode.getComponent(Sprite);
            if (sprite) {
                const originalColor = sprite.color.clone();
                sprite.color = new Color(255, 100, 100, 255);
                
                setTimeout(() => {
                    if (sprite.isValid) {
                        sprite.color = originalColor;
                    }
                }, 100);
            }
        }
    }

    private onEntityDestroyed(data: any): void {
        const fruitNode = this.fruitNodes.get(data.entityId);
        if (fruitNode) {
            if (fruitNode.parent) {
                fruitNode.removeFromParent();
            }
            this.fruitNodes.delete(data.entityId);
        }
    }

    private getSpriteForFruit(fruitType: FruitType): SpriteFrame | null {
        switch (fruitType) {
            case FruitType.APPLE:
                return this.appleSprite;
            case FruitType.BANANA:
                return this.bananaSprite;
            case FruitType.ORANGE:
                return this.orangeSprite;
            case FruitType.MUSHROOM:
                return this.mushroomSprite;
            default:
                return null;
        }
    }
} 