import { Component, _decorator, AudioClip, AudioSource, resources, tween, Node } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';
import { SoundType } from '../../Core/ECS/Components/AudioComponent';

const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    @property({ type: [AudioSource] })
    public sfxAudioSourcePool: AudioSource[] = [];

    @property(AudioSource)
    public musicAudioSource: AudioSource = null;

    @property({ type: Number, min: 1, max: 20 })
    public maxSfxSources: number = 8;

    private soundClips: Map<SoundType, AudioClip> = new Map();
    
    private masterVolume: number = 1.0;
    private sfxVolume: number = 0.7;
    private musicVolume: number = 0.4;

    private pendingSounds: Array<{ 
        soundType: SoundType; 
        volume: number; 
        delay?: number; 
        fadeIn?: number; 
        fadeOut?: number; 
    }> = [];
    private pendingMusic: Array<{ 
        soundType: SoundType; 
        delay?: number; 
        fadeIn?: number; 
        fadeOut?: number; 
    }> = [];
    private isLoaded: boolean = false;

    private activeFadeOuts: Set<AudioSource> = new Set();

    private busyAudioSources: Set<AudioSource> = new Set();

    private readonly soundPaths: Record<SoundType, string> = {
        [SoundType.FRUIT_COLLECT]: 'Audio/SFX/fruit_collect',
        [SoundType.FRUIT_MISS]: 'Audio/SFX/fruit_miss',
        [SoundType.DAMAGE_TAKEN]: 'Audio/SFX/damage_taken',
        [SoundType.COMBO_START]: 'Audio/SFX/combo_start',
        [SoundType.COMBO_UPDATE]: 'Audio/SFX/combo_update',
        [SoundType.COMBO_END]: 'Audio/SFX/combo_end',
        [SoundType.BUTTON_CLICK]: 'Audio/SFX/button_click',
        [SoundType.GAME_START]: 'Audio/SFX/game_start',
        [SoundType.GAME_OVER]: 'Audio/SFX/game_over',
        [SoundType.BACKGROUND_MUSIC]: 'Audio/Music/background_music'
    };

    protected onLoad(): void {
        EventBus.on(GameEvents.SOUND_PLAY, this.onSoundPlay.bind(this));
        EventBus.on(GameEvents.SOUND_STOP, this.onSoundStop.bind(this));
        EventBus.on(GameEvents.SOUND_VOLUME_CHANGED, this.onVolumeChanged.bind(this));
        EventBus.on(GameEvents.MUSIC_PLAY, this.onMusicPlay.bind(this));
        EventBus.on(GameEvents.MUSIC_STOP, this.onMusicStop.bind(this));

        this.initializeAudioSourcePool();
        this.loadSounds();
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.SOUND_PLAY, this.onSoundPlay.bind(this));
        EventBus.off(GameEvents.SOUND_STOP, this.onSoundStop.bind(this));
        EventBus.off(GameEvents.SOUND_VOLUME_CHANGED, this.onVolumeChanged.bind(this));
        EventBus.off(GameEvents.MUSIC_PLAY, this.onMusicPlay.bind(this));
        EventBus.off(GameEvents.MUSIC_STOP, this.onMusicStop.bind(this));
    }

    private initializeAudioSourcePool(): void {
        if (this.sfxAudioSourcePool.length > 0) {
            console.log(`🎵 Используется пул из ${this.sfxAudioSourcePool.length} AudioSource-ов`);
            return;
        }

        console.log(`🎵 Создание пула из ${this.maxSfxSources} AudioSource-ов`);
        for (let i = 0; i < this.maxSfxSources; i++) {
            const audioNode = new Node(`SFX_AudioSource_${i}`);
            audioNode.setParent(this.node);
            
            const audioSource = audioNode.addComponent(AudioSource);
            this.sfxAudioSourcePool.push(audioSource);
        }
    }

    private getAvailableAudioSource(): AudioSource | null {
        for (const audioSource of this.sfxAudioSourcePool) {
            if (!this.busyAudioSources.has(audioSource) && !audioSource.playing) {
                return audioSource;
            }
        }
        
        for (const audioSource of this.sfxAudioSourcePool) {
            if (!this.activeFadeOuts.has(audioSource)) {
                console.warn('🎵 Все AudioSource заняты, переиспользуем самый старый');
                return audioSource;
            }
        }
        
        return null;
    }

    private markAudioSourceBusy(audioSource: AudioSource): void {
        this.busyAudioSources.add(audioSource);
    }

    private releaseAudioSource(audioSource: AudioSource): void {
        this.busyAudioSources.delete(audioSource);
        this.activeFadeOuts.delete(audioSource);
    }

    private loadSounds(): void {
        let loadedCount = 0;
        const totalSounds = Object.keys(this.soundPaths).length;
        
        for (const soundType in this.soundPaths) {
            const path = this.soundPaths[soundType as SoundType];
            resources.load(path, AudioClip, (err, clip) => {
                loadedCount++;
                
                if (err) {
                    console.warn(`Не удалось загрузить звук ${soundType}: ${err.message}`);
                } else {
                    this.soundClips.set(soundType as SoundType, clip);
                }
                
                if (loadedCount === totalSounds) {
                    console.log(`🎉 Загружено (${this.soundClips.size}/${totalSounds} звуков!`);
                    this.isLoaded = true;
                    this.playPendingSounds();
                }
            });
        }
    }

    private playPendingSounds(): void {
        this.pendingSounds.forEach(sound => {
            this.playSound(sound.soundType, sound.volume, sound.delay, sound.fadeIn, sound.fadeOut);
        });
        this.pendingSounds = [];
        
        this.pendingMusic.forEach(music => {
            this.playMusic(music.soundType, music.delay, music.fadeIn, music.fadeOut);
        });
        this.pendingMusic = [];
    }

    private onSoundPlay(data: any): void {
        const soundType = data.soundType as SoundType;
        const volume = data.volume || 1.0;
        const delay = data.delay || 0;
        const fadeIn = data.fadeIn || 0;
        const fadeOut = data.fadeOut || 0;
        
        this.playSound(soundType, volume, delay, fadeIn, fadeOut);
    }

    private onSoundStop(data: any): void {
        const soundType = data.soundType as SoundType;
        const fadeOut = data.fadeOut || 0;
        
        this.stopSound(soundType, fadeOut);
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
        
        this.updateVolumes();
    }

    private onMusicPlay(data: any): void {
        const soundType = data.soundType as SoundType;
        const delay = data.delay || 0;
        const fadeIn = data.fadeIn || 0;
        const fadeOut = data.fadeOut || 0;
        
        this.playMusic(soundType, delay, fadeIn, fadeOut);
    }

    private onMusicStop(data: any): void {
        const fadeOut = data.fadeOut || 0;
        
        if (this.musicAudioSource && this.musicAudioSource.playing) {
            if (fadeOut > 0) {
                this.applyFadeOut(this.musicAudioSource, fadeOut);
            } else {
                this.musicAudioSource.stop();
                this.activeFadeOuts.delete(this.musicAudioSource);
            }
        }
    }

    public playSound(soundType: SoundType, volume: number = 1.0, delay: number = 0, fadeIn: number = 0, fadeOut: number = 0): void {
        const audioSource = this.getAvailableAudioSource();
        if (!audioSource) {
            console.warn('🎵 Нет доступных AudioSource для воспроизведения звука');
            return;
        }

        const clip = this.soundClips.get(soundType);
        if (!clip) {
            if (!this.isLoaded) {
                this.pendingSounds.push({ soundType, volume, delay, fadeIn, fadeOut });
                return;
            } else {
                return;
            }
        }

        const executePlay = () => {
            this.markAudioSourceBusy(audioSource);
            
            audioSource.clip = clip;
            audioSource.loop = false;
            
            const targetVolume = volume * this.sfxVolume * this.masterVolume;
            
            if (fadeIn > 0) {
                audioSource.volume = 0;
                audioSource.play();
                
                tween(audioSource)
                    .to(fadeIn, { volume: targetVolume })
                    .start();
            } else {
                audioSource.volume = targetVolume;
                audioSource.play();
            }
            
            const clipDuration = clip.getDuration();
            this.scheduleOnce(() => {
                this.releaseAudioSource(audioSource);
            }, clipDuration);
            
            if (fadeOut > 0) {
                const fadeOutStartTime = Math.max(0, clipDuration - fadeOut);
                
                this.scheduleOnce(() => {
                    this.applyFadeOut(audioSource, fadeOut);
                }, fadeOutStartTime);
            }
        };

        if (delay > 0) {
            this.scheduleOnce(executePlay, delay);
        } else {
            executePlay();
        }
    }

    public playMusic(soundType: SoundType, delay: number = 0, fadeIn: number = 0, fadeOut: number = 0): void {
        if (!this.musicAudioSource) {
            console.warn('Music AudioSource не назначен');
            return;
        }

        const clip = this.soundClips.get(soundType);
        if (!clip) {
            if (!this.isLoaded) {
                this.pendingMusic.push({ soundType, delay, fadeIn, fadeOut });
                return;
            } else {
                return;
            }
        }

        const executePlay = () => {
            if (this.musicAudioSource.playing) {
                this.musicAudioSource.stop();
            }

            this.musicAudioSource.clip = clip;
            this.musicAudioSource.loop = true;
            
            const targetVolume = this.musicVolume * this.masterVolume;
            
            if (fadeIn > 0) {
                this.musicAudioSource.volume = 0;
                this.musicAudioSource.play();
                
                tween(this.musicAudioSource)
                    .to(fadeIn, { volume: targetVolume })
                    .start();
            } else {
                this.musicAudioSource.volume = targetVolume;
                this.musicAudioSource.play();
            }
        };

        if (delay > 0) {
            this.scheduleOnce(executePlay, delay);
        } else {
            executePlay();
        }
    }

    public stopSound(soundType: SoundType, fadeOut: number = 0): void {
        for (const audioSource of this.sfxAudioSourcePool) {
            if (audioSource.playing) {
                if (fadeOut > 0) {
                    this.applyFadeOut(audioSource, fadeOut);
                } else {
                    audioSource.stop();
                    this.releaseAudioSource(audioSource);
                }
            }
        }
    }

    private updateVolumes(): void {
        for (const audioSource of this.sfxAudioSourcePool) {
            if (audioSource.playing) {
                audioSource.volume = this.sfxVolume * this.masterVolume;
            }
        }
        
        if (this.musicAudioSource) {
            this.musicAudioSource.volume = this.musicVolume * this.masterVolume;
        }
    }

    public getSound(soundType: SoundType): AudioClip | null {
        return this.soundClips.get(soundType) || null;
    }

    public isSoundLoaded(soundType: SoundType): boolean {
        return this.soundClips.has(soundType);
    }

    private applyFadeOut(audioSource: AudioSource, fadeOutDuration: number): void {
        if (!audioSource || !audioSource.playing) {
            return;
        }
        
        if (this.activeFadeOuts.has(audioSource)) {
            return;
        }
        
        this.activeFadeOuts.add(audioSource);
        
        tween(audioSource)
            .to(fadeOutDuration, { volume: 0 })
            .call(() => {
                audioSource.stop();
                this.releaseAudioSource(audioSource);
            })
            .start();
    }

    public stopMusicWithFadeOut(fadeOutDuration: number = 1.0): void {
        if (this.musicAudioSource && this.musicAudioSource.playing) {
            this.applyFadeOut(this.musicAudioSource, fadeOutDuration);
        }
    }

    public stopSoundWithFadeOut(soundType: SoundType, fadeOutDuration: number = 0.5): void {
        this.stopSound(soundType, fadeOutDuration);
    }

    public stopAllSounds(): void {
        for (const audioSource of this.sfxAudioSourcePool) {
            if (audioSource.playing) {
                audioSource.stop();
                this.releaseAudioSource(audioSource);
            }
        }
    }

    public stopAllSoundsWithFadeOut(fadeOutDuration: number = 0.5): void {
        for (const audioSource of this.sfxAudioSourcePool) {
            if (audioSource.playing) {
                this.applyFadeOut(audioSource, fadeOutDuration);
            }
        }
    }

    public getActiveAudioSourceCount(): number {
        return this.busyAudioSources.size;
    }

    public getPlayingAudioSourceCount(): number {
        return this.sfxAudioSourcePool.filter(source => source.playing).length;
    }
} 