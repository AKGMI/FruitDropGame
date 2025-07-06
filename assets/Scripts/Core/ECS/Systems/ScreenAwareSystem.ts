import { BaseSystem } from '../BaseSystem';
import { GameConstants } from '../../Constants/GameConstants';

export abstract class ScreenAwareSystem extends BaseSystem {
    protected screenWidth: number = GameConstants.SCREEN_WIDTH;
    protected screenHeight: number = GameConstants.SCREEN_HEIGHT;

    public setScreenDimensions(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
    }

    public getScreenWidth(): number {
        return this.screenWidth;
    }

    public getScreenHeight(): number {
        return this.screenHeight;
    }
} 