import { Component, Node, Label, _decorator, tween, Vec3, Color, UIOpacity, ParticleSystem2D, SpriteFrame, Vec2 } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('EffectViewController')
export class EffectViewController extends Component {
    @property(Node)
    public effectContainer: Node = null;

    @property(Node)
    public cameraNode: Node = null;

    @property(SpriteFrame)
    public particleSprite: SpriteFrame = null;

    private originalCameraPosition: Vec3 = new Vec3();

    protected onLoad(): void {
        EventBus.on(GameEvents.VISUAL_EFFECT_SCREEN_SHAKE, this.onScreenShake.bind(this));
        EventBus.on(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        
        if (this.cameraNode) {
            this.originalCameraPosition = this.cameraNode.position.clone();
        }
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.VISUAL_EFFECT_SCREEN_SHAKE, this.onScreenShake.bind(this));
        EventBus.off(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
    }

    private onFruitCollected(data: any): void {
        if (data.score > 0) {
            const x = data.position ? data.position.x : 0;
            const y = data.position ? data.position.y : -200;
            
            this.createHitEffect(x, y);
            this.createScorePopupDirect(data.score, x, y);
        }
    }

    private createHitEffect(x: number, y: number): void {
        if (!this.effectContainer) return;

        const directions = [
            { angle: 45, name: 'TopRight' },
            { angle: 135, name: 'TopLeft' },
            { angle: 225, name: 'BottomLeft' },
            { angle: 315, name: 'BottomRight' }
        ];

        directions.forEach((dir, index) => {
            this.scheduleOnce(() => {
                this.createCrossParticle(x, y, dir.angle, dir.name);
            }, index * 0.02);
        });
    }

    private createCrossParticle(x: number, y: number, angle: number, name: string): void {
        if (!this.effectContainer) return;

        const particleNode = new Node(`CrossParticle_${name}`);
        const particleSystem = particleNode.addComponent(ParticleSystem2D);
        
        if (this.particleSprite) {
            particleSystem.spriteFrame = this.particleSprite;
        }
        
        particleSystem.totalParticles = 3;
        particleSystem.duration = 0.15;
        particleSystem.emissionRate = 20;
        
        particleSystem.life = 0.3;
        particleSystem.lifeVar = 0.1;
        
        particleSystem.startSize = 8;
        particleSystem.startSizeVar = 2;
        particleSystem.endSize = 12;
        
        particleSystem.speed = 80;
        particleSystem.speedVar = 20;
        particleSystem.angle = angle;
        particleSystem.angleVar = 5;
        
        particleSystem.gravity = new Vec2(0, 0);
        
        particleSystem.startColor = new Color(255, 255, 100, 255);
        particleSystem.endColor = new Color(255, 150, 0, 0);
        
        particleNode.setPosition(x, y);
        this.effectContainer.addChild(particleNode);
        
        particleSystem.resetSystem();
        
        this.scheduleOnce(() => {
            if (particleNode.isValid) {
                particleNode.removeFromParent();
            }
        }, 0.5);
    }

    private onScreenShake(data: any): void {
        this.applyScreenShake(data);
    }

    private createScorePopupDirect(score: number, x: number, y: number): void {
        if (!this.effectContainer) return;

        const popupNode = new Node('ScorePopup');
        const label = popupNode.addComponent(Label);
        
        label.string = `+${score}`;
        label.fontSize = 36;
        label.color = score > 15 ? Color.YELLOW : Color.WHITE;
        
        popupNode.setPosition(x, y + 50);
        this.effectContainer.addChild(popupNode);
        
        tween(popupNode)
            .to(1.2, { 
                position: new Vec3(x, y + 120, 0)
            })
            .start();
        
        const opacity = popupNode.addComponent(UIOpacity);
        tween(opacity)
            .delay(0.8)
            .to(0.4, { opacity: 0 })
            .call(() => {
                if (popupNode.isValid) {
                    popupNode.removeFromParent();
                }
            })
            .start();
    }

    private applyScreenShake(data: any): void {
        if (!this.cameraNode) return;

        const intensity = data.intensity || 5;
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        
        this.cameraNode.setPosition(
            this.originalCameraPosition.x + shakeX,
            this.originalCameraPosition.y + shakeY,
            this.originalCameraPosition.z
        );
        
        this.scheduleOnce(() => {
            if (this.cameraNode && this.cameraNode.isValid) {
                this.cameraNode.setPosition(this.originalCameraPosition);
            }
        }, 0.05);
    }
} 