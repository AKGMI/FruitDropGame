import { BaseSystem } from '../BaseSystem';
import { EffectComponent, EffectType } from '../Components/EffectComponent';
import { PositionComponent } from '../Components/PositionComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';

export class EffectSystem extends BaseSystem {
    public onLoad(): void {
        EventBus.on(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
    }

    public onDestroy(): void {
        EventBus.off(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
    }

    public update(deltaTime: number): void {
        const entities = this.world.getEntitiesWith(['EffectComponent']);
        
        entities.forEach(entityId => {
            const effect = this.world.getComponent<EffectComponent>(entityId, 'EffectComponent');
            
            if (effect && effect.isActive) {
                effect.updateTime(deltaTime);
                
                if (effect.isComplete()) {
                    this.onEffectComplete(entityId, effect);
                } else {
                    this.processEffect(entityId, effect);
                }
            }
        });
    }

    private processEffect(entityId: number, effect: EffectComponent): void {
        const progress = effect.getProgress();
        
        switch (effect.type) {
            case EffectType.SCREEN_SHAKE:
                this.applyScreenShake(entityId, effect, progress);
                break;
        }
    }

    private applyScreenShake(entityId: number, effect: EffectComponent, progress: number): void {
        const intensity = effect.intensity * (1.0 - progress);
        
        EventBus.emit(GameEvents.VISUAL_EFFECT_SCREEN_SHAKE, {
            entityId: 'screen',
            intensity: intensity
        });
    }

    private onEffectComplete(entityId: number, effect: EffectComponent): void {
        this.world.removeComponent(entityId, 'EffectComponent');
    }

    private onDamageTaken(data: any): void {
        if (data.entityId) {
            this.createDamageEffects(data.entityId, data.damage);
        }
    }

    private createDamageEffects(entityId: number, damage: number): void {
        const position = this.world.getComponent<PositionComponent>(entityId, 'PositionComponent');
        
        if (position) {
            const shakeEntity = this.world.createEntity();
            const shakeEffect = new EffectComponent(EffectType.SCREEN_SHAKE, 0.5, damage * 50);
            this.world.addComponent(shakeEntity, shakeEffect);
        }
    }
} 