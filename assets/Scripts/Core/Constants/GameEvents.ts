/**
 * Централизованные названия событий игры
 */
export enum GameEvents {
    // События игрового процесса
    GAME_STARTED = 'game_started',
    GAME_PAUSED = 'game_paused',
    GAME_RESUMED = 'game_resumed',
    GAME_OVER = 'game_over',
    GAME_RESTARTED = 'game_restarted',

    // События позиции
    BASKET_POSITION_CHANGED = 'basket_position_changed',
    FRUIT_POSITION_CHANGED = 'fruit_position_changed',
    FRUIT_ROTATION_CHANGED = 'fruit_rotation_changed',
    POSITION_CHANGED = 'position_changed',

    // События анимации
    ANIMATION_CHANGED = 'animation_changed',

    // События создания сущностей
    BASKET_CREATED = 'basket_created',
    FRUIT_SPAWNED = 'fruit_spawned',
    ENTITY_DESTROYED = 'entity_destroyed',

    // События взаимодействия
    FRUIT_COLLECTED = 'fruit_collected',
    FRUIT_MISSED = 'fruit_missed',
    HAZARD_COLLISION = 'hazard_collision',

    // События здоровья
    DAMAGE_TAKEN = 'damage_taken',
    HEALTH_RESTORED = 'health_restored',

    // События комбо
    COMBO_STARTED = 'combo_started',
    COMBO_UPDATED = 'combo_updated',
    COMBO_ENDED = 'combo_ended',
    COMBO_MULTIPLIER_CHANGED = 'combo_multiplier_changed',
    COMBO_TIME_WARNING = 'combo_time_warning',

    // События звуков
    SOUND_PLAY = 'sound_play',
    SOUND_STOP = 'sound_stop',
    SOUND_VOLUME_CHANGED = 'sound_volume_changed',
    MUSIC_PLAY = 'music_play',
    MUSIC_STOP = 'music_stop',

    // События UI
    SCORE_CHANGED = 'score_changed',
    TIMER_UPDATED = 'timer_updated',

    // Визуальные эффекты
    VISUAL_EFFECT_SCREEN_SHAKE = 'visual_effect_screen_shake',
}