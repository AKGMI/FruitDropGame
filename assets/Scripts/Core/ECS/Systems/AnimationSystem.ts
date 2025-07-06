import { BaseSystem } from '../BaseSystem';
import { AnimationComponent, AnimationType } from '../Components/AnimationComponent';
import { PositionComponent } from '../Components/PositionComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class AnimationSystem extends BaseSystem {
    public onLoad(): void {
        EventBus.on(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.on(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
    }

    public onDestroy(): void {
        EventBus.off(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.off(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
    }

    public update(deltaTime: number): void {
        const animationEntities = this.world.getEntitiesWith(['AnimationComponent']);
        
        animationEntities.forEach(entityId => {
            const animation = this.world.getComponent<AnimationComponent>(entityId, 'AnimationComponent');
            
            if (animation && animation.isPlaying && !animation.isPaused) {
                animation.elapsed += deltaTime * animation.speed;
                
                if (animation.isComplete()) {
                    if (animation.loop) {
                        animation.reset();
                        animation.play();
                    } else {
                        animation.stop();
                        this.onAnimationComplete(entityId, animation);
                    }
                } else {
                    this.updateAnimation(entityId, animation);
                }
            }
        });
    }

    private updateAnimation(entityId: number, animation: AnimationComponent): void {
        const progress = animation.getProgress();
        
        switch (animation.type) {
            case AnimationType.SCALE_PULSE:
                this.updateScalePulseAnimation(entityId, animation, progress);
                break;
            case AnimationType.FADE_IN:
                this.updateFadeInAnimation(entityId, animation, progress);
                break;
            case AnimationType.FADE_OUT:
                this.updateFadeOutAnimation(entityId, animation, progress);
                break;
            case AnimationType.BOUNCE:
                this.updateBounceAnimation(entityId, animation, progress);
                break;
            case AnimationType.ROTATE:
                this.updateRotateAnimation(entityId, animation, progress);
                break;
            case AnimationType.SHAKE:
                this.updateShakeAnimation(entityId, animation, progress);
                break;
            case AnimationType.COLLECT_EFFECT:
                this.updateCollectEffectAnimation(entityId, animation, progress);
                break;
            case AnimationType.DAMAGE_EFFECT:
                this.updateDamageEffectAnimation(entityId, animation, progress);
                break;
        }
    }

    private updateScalePulseAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        const baseScale = animation.getParameter('baseScale') || 1.0;
        const amplitude = animation.getParameter('amplitude') || 0.2;
        const frequency = animation.getParameter('frequency') || 2.0;
        
        const scale = baseScale + Math.sin(progress * Math.PI * frequency) * amplitude;
        
        EventBus.emit(GameEvents.ANIMATION_CHANGED, {
            entityId: entityId,
            scaleX: scale,
            scaleY: scale
        });
    }

    private updateFadeInAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        EventBus.emit(GameEvents.ANIMATION_CHANGED, {
            entityId: entityId,
            alpha: progress
        });
    }

    private updateFadeOutAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        EventBus.emit(GameEvents.ANIMATION_CHANGED, {
            entityId: entityId,
            alpha: 1.0 - progress
        });
    }

    private updateBounceAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        const baseY = animation.getParameter('baseY') || 0;
        const height = animation.getParameter('height') || 50;
        
        const bounceProgress = progress * 4 * Math.PI;
        const offsetY = Math.abs(Math.sin(bounceProgress)) * height * (1 - progress);
        
        const position = this.world.getComponent<PositionComponent>(entityId, 'PositionComponent');
        if (position) {
            position.y = baseY + offsetY;
        }
    }

    private updateRotateAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        const startRotation = animation.getParameter('startRotation') || 0;
        const endRotation = animation.getParameter('endRotation') || 360;
        const currentRotation = startRotation + (endRotation - startRotation) * progress;
        
        EventBus.emit(GameEvents.ANIMATION_CHANGED, {
            entityId: entityId,
            rotation: currentRotation
        });
    }

    private updateShakeAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        const baseX = animation.getParameter('baseX') || 0;
        const baseY = animation.getParameter('baseY') || 0;
        const intensity = animation.getParameter('intensity') || 5;
        
        const shakeX = (Math.random() - 0.5) * intensity * (1 - progress);
        const shakeY = (Math.random() - 0.5) * intensity * (1 - progress);
        
        const position = this.world.getComponent<PositionComponent>(entityId, 'PositionComponent');
        if (position) {
            position.x = baseX + shakeX;
            position.y = baseY + shakeY;
        }
    }

    private updateCollectEffectAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        const startScale = 1.0;
        const endScale = 1.5;
        const scale = startScale + (endScale - startScale) * progress;
        
        const alpha = 1.0 - progress;
        
        EventBus.emit(GameEvents.ANIMATION_CHANGED, {
            entityId: entityId,
            scaleX: scale,
            scaleY: scale,
            alpha: alpha
        });
    }

    private updateDamageEffectAnimation(entityId: number, animation: AnimationComponent, progress: number): void {
        const flashProgress = Math.sin(progress * Math.PI * 8);
        const tint = flashProgress > 0 ? 0.5 : 1.0;
        
        EventBus.emit(GameEvents.ANIMATION_CHANGED, {
            entityId: entityId,
            colorR: 1.0,
            colorG: tint,
            colorB: tint
        });
    }

    private onAnimationComplete(entityId: number, animation: AnimationComponent): void {
        this.world.removeComponent(entityId, 'AnimationComponent');
        
        if (animation.type === AnimationType.COLLECT_EFFECT) {
            this.world.destroyEntity(entityId);
        }
    }

    private onFruitCollected(data: any): void {
        if (data.entityId) {
            this.createCollectAnimation(data.entityId);
        }
    }

    private onDamageTaken(data: any): void {
        if (data.entityId) {
            this.createDamageAnimation(data.entityId);
        }
    }

    private createCollectAnimation(entityId: number): void {
        const animation = new AnimationComponent(AnimationType.COLLECT_EFFECT, 0.5);
        animation.play();
        this.world.addComponent(entityId, animation);
    }

    private createDamageAnimation(entityId: number): void {
        const animation = new AnimationComponent(AnimationType.DAMAGE_EFFECT, 0.8);
        animation.play();
        this.world.addComponent(entityId, animation);
    }

    public createShakeAnimation(entityId: number, intensity: number = 5, duration: number = 0.3): void {
        const animation = new AnimationComponent(AnimationType.SHAKE, duration);
        animation.setParameter('intensity', intensity);
        
        const position = this.world.getComponent<PositionComponent>(entityId, 'PositionComponent');
        if (position) {
            animation.setParameter('baseX', position.x);
            animation.setParameter('baseY', position.y);
        }
        
        animation.play();
        this.world.addComponent(entityId, animation);
    }
} 