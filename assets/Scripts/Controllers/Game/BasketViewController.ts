import { Component, _decorator, Color, Sprite, UIOpacity } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('BasketViewController')
export class BasketViewController extends Component {
    private entityId: number = -1;

    onLoad(): void {
        EventBus.on(GameEvents.BASKET_CREATED, this.onBasketCreated.bind(this));
        EventBus.on(GameEvents.BASKET_POSITION_CHANGED, this.onPositionChanged.bind(this));
        EventBus.on(GameEvents.ANIMATION_CHANGED, this.onAnimationChanged.bind(this));
        
        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }
    }

    onDestroy(): void {
        EventBus.off(GameEvents.BASKET_CREATED, this.onBasketCreated.bind(this));
        EventBus.off(GameEvents.BASKET_POSITION_CHANGED, this.onPositionChanged.bind(this));
        EventBus.off(GameEvents.ANIMATION_CHANGED, this.onAnimationChanged.bind(this));
    }

    private onBasketCreated(data: any): void {
        this.entityId = data.entityId;
        this.node.setPosition(data.x, data.y);
    }

    private onPositionChanged(data: any): void {
        if (data.entityId === this.entityId) {
            this.node.setPosition(data.x, data.y);
        }
    }

    private onAnimationChanged(data: any): void {
        if (data.entityId !== this.entityId) return;
        
        if (data.scaleX !== undefined && data.scaleY !== undefined) {
            this.node.setScale(data.scaleX, data.scaleY);
        }

        if (data.alpha !== undefined) {
            const opacity = this.node.getComponent(UIOpacity);
            if (opacity) {
                opacity.opacity = Math.floor(data.alpha * 255);
            }
        }

        if (data.colorR !== undefined && data.colorG !== undefined && data.colorB !== undefined) {
            const sprite = this.node.getComponent(Sprite);
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

    public setEntityId(entityId: number): void {
        this.entityId = entityId;
    }
} 