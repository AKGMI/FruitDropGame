import { ServiceLocator } from '../ServiceLocator/ServiceLocator';
import { ECSWorld } from './ECSWorld';

export abstract class BaseSystem {
    public enabled: boolean = true;

    protected getWorld(): ECSWorld {
        const world = ServiceLocator.get<ECSWorld>('ECSWorld');
        if (!world) {
            throw new Error('ECSWorld не найден в ServiceLocator.');
        }
        return world;
    }

    protected get world(): ECSWorld {
        return this.getWorld();
    }

    public onLoad(): void {}

    public abstract update(deltaTime: number): void;

    public onDestroy(): void {}

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
} 