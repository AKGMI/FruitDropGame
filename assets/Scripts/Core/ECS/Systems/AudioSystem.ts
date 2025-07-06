import { BaseSystem } from '../BaseSystem';
import { AudioComponent, SoundType } from '../Components/AudioComponent';
import { EventBus } from '../../EventBus/EventBus';
import { GameEvents } from '../../Constants/GameEvents';
import { GameConstants } from '../../Constants/GameConstants';

export class AudioSystem extends BaseSystem {
    private masterVolume: number = GameConstants.SOUND_VOLUME_MASTER;
    private sfxVolume: number = GameConstants.SOUND_VOLUME_SFX;
    private musicVolume: number = GameConstants.SOUND_VOLUME_MUSIC;
    private soundQueue: SoundType[] = [];

    public onLoad(): void {
        EventBus.on(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.on(GameEvents.FRUIT_MISSED, this.onFruitMissed.bind(this));
        EventBus.on(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
        EventBus.on(GameEvents.COMBO_STARTED, this.onComboStarted.bind(this));
        EventBus.on(GameEvents.COMBO_UPDATED, this.onComboUpdated.bind(this));
        EventBus.on(GameEvents.COMBO_ENDED, this.onComboEnded.bind(this));
        EventBus.on(GameEvents.GAME_STARTED, this.onGameStarted.bind(this));
        EventBus.on(GameEvents.GAME_OVER, this.onGameOver.bind(this));
        
        EventBus.on(GameEvents.SOUND_VOLUME_CHANGED, this.onVolumeChanged.bind(this));
    }

    public onDestroy(): void {
        EventBus.off(GameEvents.FRUIT_COLLECTED, this.onFruitCollected.bind(this));
        EventBus.off(GameEvents.FRUIT_MISSED, this.onFruitMissed.bind(this));
        EventBus.off(GameEvents.DAMAGE_TAKEN, this.onDamageTaken.bind(this));
        EventBus.off(GameEvents.COMBO_STARTED, this.onComboStarted.bind(this));
        EventBus.off(GameEvents.COMBO_UPDATED, this.onComboUpdated.bind(this));
        EventBus.off(GameEvents.COMBO_ENDED, this.onComboEnded.bind(this));
        EventBus.off(GameEvents.GAME_STARTED, this.onGameStarted.bind(this));
        EventBus.off(GameEvents.GAME_OVER, this.onGameOver.bind(this));

        EventBus.off(GameEvents.SOUND_VOLUME_CHANGED, this.onVolumeChanged.bind(this));
    }

    public update(deltaTime: number): void {
        this.processSoundQueue();
    }

    private processSoundQueue(): void {
        while (this.soundQueue.length > 0) {
            const soundType = this.soundQueue.shift();
            if (soundType) {
                this.playSound(soundType);
            }
        }
    }

    private playSound(soundType: SoundType): void {
        const audioEntity = this.world.createEntity();
        const audioComponent = new AudioComponent(soundType);
        
        const config = AudioComponent.getDefaultConfig(soundType);
        Object.assign(audioComponent, config);
        
        const isMusicTrack = soundType === SoundType.BACKGROUND_MUSIC;
        const volumeMultiplier = isMusicTrack ? this.musicVolume : this.sfxVolume;
        audioComponent.volume *= volumeMultiplier * this.masterVolume;
        
        audioComponent.play();
        this.world.addComponent(audioEntity, audioComponent);
        
        this.actuallyPlaySound(audioComponent);
        
        this.world.destroyEntity(audioEntity);
    }

    private actuallyPlaySound(audio: AudioComponent): void {
        const isMusicTrack = audio.soundType === SoundType.BACKGROUND_MUSIC
        
        if (isMusicTrack) {
            EventBus.emit(GameEvents.MUSIC_PLAY, {
                soundType: audio.soundType,
                volume: audio.volume,
                loop: audio.isLooped,
                delay: audio.delay,
                fadeIn: audio.fadeIn,
                fadeOut: audio.fadeOut
            });
        } else {
            EventBus.emit(GameEvents.SOUND_PLAY, {
                soundType: audio.soundType,
                volume: audio.volume,
                delay: audio.delay,
                fadeIn: audio.fadeIn,
                fadeOut: audio.fadeOut
            });
        }
    }

    private onFruitCollected(data: any): void {
        this.queueSound(SoundType.FRUIT_COLLECT);
    }

    private onFruitMissed(data: any): void {
        this.queueSound(SoundType.FRUIT_MISS);
    }

    private onDamageTaken(data: any): void {
        this.queueSound(SoundType.DAMAGE_TAKEN);
    }

    private onComboStarted(data: any): void {
        this.queueSound(SoundType.COMBO_START);
    }

    private onComboUpdated(data: any): void {
        this.queueSound(SoundType.COMBO_UPDATE);
    }

    private onComboEnded(data: any): void {
        this.queueSound(SoundType.COMBO_END);
    }

    private onGameStarted(data: any): void {
        this.queueSound(SoundType.GAME_START);
        this.queueSound(SoundType.BACKGROUND_MUSIC);
    }

    private onGameOver(data: any): void {
        this.queueSound(SoundType.GAME_OVER);
    }

    private onVolumeChanged(data: any): void {
        if (data.masterVolume !== undefined) {
            this.masterVolume = data.masterVolume;
        }
        if (data.sfxVolume !== undefined) {
            this.sfxVolume = data.sfxVolume;
        }
        if (data.musicVolume !== undefined) {
            this.musicVolume = data.musicVolume;
        }
    }

    private queueSound(soundType: SoundType): void {
        this.soundQueue.push(soundType);
    }

    private stopSound(soundType: SoundType, fadeOut: number = 0): void {
        const isMusicTrack = soundType === SoundType.BACKGROUND_MUSIC;
        
        if (isMusicTrack) {
            EventBus.emit(GameEvents.MUSIC_STOP, { soundType, fadeOut });
        } else {
            EventBus.emit(GameEvents.SOUND_STOP, { soundType, fadeOut });
        }
    }

    private stopMusic(fadeOut: number = 0): void {
        this.stopSound(SoundType.BACKGROUND_MUSIC, fadeOut);
    }

    public stopAllSounds(): void {
        this.soundQueue = [];
        
        EventBus.emit(GameEvents.MUSIC_STOP, { fadeOut: 0 });
        EventBus.emit(GameEvents.SOUND_STOP, { fadeOut: 0 });
    }

    public stopMusicWithFadeOut(fadeOutDuration: number = 1.0): void {
        this.stopMusic(fadeOutDuration);
    }

    public playButtonClick(): void {
        this.queueSound(SoundType.BUTTON_CLICK);
    }

    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    public setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
} 