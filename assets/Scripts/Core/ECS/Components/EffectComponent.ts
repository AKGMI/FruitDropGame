import { BaseComponent } from '../BaseComponent';

export enum EffectType {
    SCREEN_SHAKE = 'screen_shake'
}

export class EffectComponent extends BaseComponent {
    public static readonly componentName = 'EffectComponent';
    
    public type: EffectType;
    public duration: number;
    public elapsed: number = 0;
    public isActive: boolean = true;
    public intensity: number = 1.0;
    public parameters: Map<string, any> = new Map();

    constructor(type: EffectType, duration: number = 1.0, intensity: number = 1.0) {
        super();
        this.type = type;
        this.duration = duration;
        this.intensity = intensity;
    }

    public isComplete(): boolean {
        return this.elapsed >= this.duration;
    }

    public getProgress(): number {
        return Math.min(this.elapsed / this.duration, 1.0);
    }

    public getRemainingTime(): number {
        return Math.max(0, this.duration - this.elapsed);
    }

    public setParameter(key: string, value: any): void {
        this.parameters.set(key, value);
    }

    public getParameter(key: string): any {
        return this.parameters.get(key);
    }

    public hasParameter(key: string): boolean {
        return this.parameters.has(key);
    }

    public updateTime(deltaTime: number): void {
        if (this.isActive) {
            this.elapsed += deltaTime;
        }
    }

    public stop(): void {
        this.isActive = false;
    }

    public reset(): void {
        this.elapsed = 0;
        this.isActive = true;
    }
} 