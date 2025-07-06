/**
 * Централизованные константы игры
 */
export class GameConstants {
    // Размеры экрана
    public static readonly SCREEN_WIDTH = 1920;
    public static readonly SCREEN_HEIGHT = 1080;

    // Размеры игровых объектов
    public static readonly FRUIT_SIZE = {
        width: 100,
        height: 100
    };

    public static readonly BASKET_SIZE = {
        width: 100,
        height: 50
    };

    // Скорости и движение
    public static readonly FRUIT_FALL_SPEED = 150;
    public static readonly FRUIT_SPEED_VARIATION = 50; // Разброс скорости ±50
    public static readonly BASKET_SPEED = 300;

    // Вращение фруктов
    public static readonly FRUIT_ROTATION_SPEED_MIN = -180;
    public static readonly FRUIT_ROTATION_SPEED_MAX = 180;

    // Время и интервалы
    public static readonly GAME_TIME = 5; // секунд
    public static readonly FRUIT_SPAWN_RATE = 1.5; // секунд
    public static readonly FRUIT_LIFETIME = 30; // секунд

    // Система здоровья
    public static readonly BASKET_MAX_HEALTH = 3;
    public static readonly INVULNERABILITY_DURATION = 1.0; // секунд

    // Стратегии падения - параметры
    public static readonly ZIGZAG_AMPLITUDE = 100;
    public static readonly ZIGZAG_FREQUENCY = 2;
    public static readonly ACCELERATED_ACCELERATION = -100;
    public static readonly ACCELERATED_MAX_VELOCITY = -1000;

    public static readonly BASKET_Y_POSITION = 100;

    // Система комбо
    public static readonly COMBO_MULTIPLIER_BASE = 1.0;
    public static readonly COMBO_MULTIPLIER_INCREMENT = 0.2;
    public static readonly COMBO_MULTIPLIER_MAX = 3.0;
    public static readonly COMBO_TIMEOUT = 10.0;
    public static readonly COMBO_MIN_STREAK = 3;
    public static readonly COMBO_LEVELS = [3, 5, 10, 15, 20];

    // Звуковая система
    public static readonly SOUND_VOLUME_MASTER = 1.0;
    public static readonly SOUND_VOLUME_SFX = 0.8;
    public static readonly SOUND_VOLUME_MUSIC = 0.6;
} 