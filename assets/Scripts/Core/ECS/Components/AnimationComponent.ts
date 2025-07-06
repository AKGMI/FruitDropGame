import { BaseComponent } from '../BaseComponent';

export enum AnimationType {
    SCALE_PULSE = 'scale_pulse',
    FADE_IN = 'fade_in',
    FADE_OUT = 'fade_out',
    BOUNCE = 'bounce',
    ROTATE = 'rotate',
    SLIDE_IN = 'slide_in',
    SLIDE_OUT = 'slide_out',
    SHAKE = 'shake',
    COLLECT_EFFECT = 'collect_effect',
    DAMAGE_EFFECT = 'damage_effect'
}

export class AnimationComponent extends BaseComponent {
    public static readonly componentName = 'AnimationComponent';

    public type: AnimationType;
    public isPlaying: boolean = false;
    public isPaused: boolean = false;
    public speed: number = 1.0;
    public duration: number = 1.0;
    public elapsed: number = 0;
    public loop: boolean = false;
    public autoStart: boolean = true;
    public parameters: Map<string, any> = new Map();

    constructor(type: AnimationType, duration: number = 1.0, speed: number = 1.0) {
        super();
        this.type = type;
        this.duration = duration;
        this.speed = speed;
    }

    public play(): void {
        this.isPlaying = true;
        this.isPaused = false;
        this.elapsed = 0;
    }

    public stop(): void {
        this.isPlaying = false;
        this.isPaused = false;
        this.elapsed = 0;
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }

    public isComplete(): boolean {
        return this.elapsed >= this.duration;
    }

    public getProgress(): number {
        return Math.min(this.elapsed / this.duration, 1.0);
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

    public reset(): void {
        this.elapsed = 0;
        this.isPlaying = false;
        this.isPaused = false;
    }
} 