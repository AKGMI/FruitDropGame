import { BaseComponent } from '../BaseComponent';

export enum SoundType {
    // Звуки действий
    FRUIT_COLLECT = 'fruit_collect',
    FRUIT_MISS = 'fruit_miss',
    DAMAGE_TAKEN = 'damage_taken',
    
    // Звуки комбо
    COMBO_START = 'combo_start',
    COMBO_UPDATE = 'combo_update',
    COMBO_END = 'combo_end',
    
    // Звуки интерфейса
    BUTTON_CLICK = 'button_click',
    GAME_START = 'game_start',
    GAME_OVER = 'game_over',
    
    // Музыка
    BACKGROUND_MUSIC = 'background_music',
}

export class AudioComponent extends BaseComponent {
    public static readonly componentName = 'AudioComponent';

    public soundType: SoundType;
    public volume: number = 1.0;
    public isLooped: boolean = false;
    public isPlaying: boolean = false;
    public isPaused: boolean = false;
    public soundPath: string = '';
    public delay: number = 0;
    public fadeIn: number = 0;
    public fadeOut: number = 0;

    constructor(soundType: SoundType, soundPath: string = '', volume: number = 1.0) {
        super();
        this.soundType = soundType;
        this.soundPath = soundPath;
        this.volume = volume;
    }

    public play(): void {
        this.isPlaying = true;
        this.isPaused = false;
    }

    public stop(): void {
        this.isPlaying = false;
        this.isPaused = false;
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }

    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    public static getDefaultConfig(soundType: SoundType): Partial<AudioComponent> {
        switch (soundType) {
            case SoundType.FRUIT_COLLECT:
                return { volume: 0.7 };
            case SoundType.FRUIT_MISS:
                return { volume: 0.5, fadeOut: 0.2 };
            case SoundType.DAMAGE_TAKEN:
                return { volume: 0.8, fadeIn: 0.1 };
            case SoundType.COMBO_START:
                return { volume: 0.6, fadeIn: 0.3 };
            case SoundType.COMBO_UPDATE:
                return { volume: 0.5, delay: 0.1 };
            case SoundType.COMBO_END:
                return { volume: 0.7, fadeOut: 0.5 };
            case SoundType.BUTTON_CLICK:
                return { volume: 0.6 };
            case SoundType.GAME_START:
                return { volume: 0.8, fadeIn: 0.5 };
            case SoundType.GAME_OVER:
                return { volume: 0.9, fadeIn: 0.3 };
            case SoundType.BACKGROUND_MUSIC:
                return { volume: 0.3, isLooped: true, fadeIn: 2.0 };
            default:
                return { volume: 1.0 };
        }
    }
} 