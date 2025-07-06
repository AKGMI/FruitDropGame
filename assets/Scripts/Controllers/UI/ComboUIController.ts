import { _decorator, Component, Label, Node, tween, Vec3, Color, UIOpacity } from 'cc';
import { EventBus } from '../../Core/EventBus/EventBus';
import { GameEvents } from '../../Core/Constants/GameEvents';

const { ccclass, property } = _decorator;

@ccclass('ComboUIController')
export class ComboUIController extends Component {
    @property(Label)
    public comboLabel: Label = null;

    @property(Label)
    public multiplierLabel: Label = null;

    @property(Label)
    public levelLabel: Label = null;

    @property(Node)
    public comboContainer: Node = null;

    private isVisible: boolean = false;
    private isBlinking: boolean = false;
    private blinkTween: any = null;
    private opacityComponent: UIOpacity = null;

    protected onLoad(): void {
        EventBus.on(GameEvents.COMBO_STARTED, this.onComboStarted.bind(this));
        EventBus.on(GameEvents.COMBO_UPDATED, this.onComboUpdated.bind(this));
        EventBus.on(GameEvents.COMBO_ENDED, this.onComboEnded.bind(this));
        EventBus.on(GameEvents.GAME_RESTARTED, this.onGameRestarted.bind(this));
        EventBus.on(GameEvents.COMBO_TIME_WARNING, this.onComboTimeWarning.bind(this));

        if (this.comboContainer) {
            this.opacityComponent = this.comboContainer.getComponent(UIOpacity);
            if (!this.opacityComponent) {
                this.opacityComponent = this.comboContainer.addComponent(UIOpacity);
            }
        }

        this.hideCombo();
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.COMBO_STARTED, this.onComboStarted.bind(this));
        EventBus.off(GameEvents.COMBO_UPDATED, this.onComboUpdated.bind(this));
        EventBus.off(GameEvents.COMBO_ENDED, this.onComboEnded.bind(this));
        EventBus.off(GameEvents.GAME_RESTARTED, this.onGameRestarted.bind(this));
        EventBus.off(GameEvents.COMBO_TIME_WARNING, this.onComboTimeWarning.bind(this));
        
        this.stopBlinking();
    }

    private onComboStarted(data: any): void {
        this.showCombo();
        this.updateDisplay(data);
        this.playStartAnimation();
    }

    private onComboUpdated(data: any): void {
        this.updateDisplay(data);
        this.playUpdateAnimation();
        
        if (this.isBlinking) {
            this.stopBlinking();
        }
    }

    private onComboEnded(data: any): void {
        this.stopBlinking();
        this.playEndAnimation();
    }

    private onComboTimeWarning(data: any): void {
        if (!this.isBlinking) {
            this.startBlinking(data.isUrgent);
        }
    }

    private onGameRestarted(data: any): void {
        this.stopBlinking();
        this.hideCombo();
    }

    private updateDisplay(data: any): void {
        if (this.comboLabel) {
            this.comboLabel.string = `Серия: ${data.streak}`;
        }

        if (this.multiplierLabel) {
            this.multiplierLabel.string = `x${data.multiplier.toFixed(1)}`;
        }

        if (this.levelLabel && data.levelText) {
            this.levelLabel.string = data.levelText;
        }

        this.updateColors(data.level);
    }

    private updateColors(level: number): void {
        let color = '#FFFFFF';
        
        switch (level) {
            case 1: color = '#90EE90'; break;
            case 2: color = '#FFD700'; break;
            case 3: color = '#FF6B35'; break;
            case 4: color = '#FF1493'; break;
            case 5: color = '#9370DB'; break;
            default: color = '#FF0000'; break;
        }

        if (this.comboLabel) {
            this.comboLabel.color = Color.fromHEX(new Color(), color);
        }
        if (this.multiplierLabel) {
            this.multiplierLabel.color = Color.fromHEX(new Color(), color);
        }
        if (this.levelLabel) {
            this.levelLabel.color = Color.fromHEX(new Color(), color);
        }
    }

    private startBlinking(isUrgent: boolean = false): void {
        if (this.isBlinking || !this.comboContainer || !this.opacityComponent) return;
        
        this.isBlinking = true;
        const blinkSpeed = isUrgent ? 0.15 : 0.25;
        const scaleVariation = isUrgent ? 0.15 : 0.1;
        const alphaMin = isUrgent ? 100 : 150;
        
        const scaleAnimation = tween(this.comboContainer)
            .to(blinkSpeed, { scale: new Vec3(1 + scaleVariation, 1 + scaleVariation, 1) })
            .to(blinkSpeed, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever();
        
        const opacityAnimation = tween(this.opacityComponent)
            .to(blinkSpeed, { opacity: alphaMin })
            .to(blinkSpeed, { opacity: 255 })
            .union()
            .repeatForever();
        
        scaleAnimation.start();
        opacityAnimation.start();
        
        this.blinkTween = { scale: scaleAnimation, opacity: opacityAnimation };
    }

    private stopBlinking(): void {
        if (!this.isBlinking) return;
        
        this.isBlinking = false;
        
        if (this.blinkTween) {
            if (this.blinkTween.scale) {
                this.blinkTween.scale.stop();
            }
            if (this.blinkTween.opacity) {
                this.blinkTween.opacity.stop();
            }
            this.blinkTween = null;
        }
        
        if (this.comboContainer) {
            this.comboContainer.setScale(1, 1, 1);
        }
        if (this.opacityComponent) {
            this.opacityComponent.opacity = 255;
        }
    }

    private showCombo(): void {
        if (!this.isVisible && this.comboContainer) {
            this.isVisible = true;
            this.comboContainer.active = true;
            this.comboContainer.setScale(0, 0, 1);
            
            if (this.opacityComponent) {
                this.opacityComponent.opacity = 255;
            }
            
            tween(this.comboContainer)
                .to(0.3, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }

    private hideCombo(): void {
        if (this.isVisible && this.comboContainer) {
            this.isVisible = false;
            
            tween(this.comboContainer)
                .to(0.2, { scale: new Vec3(0, 0, 1) })
                .call(() => {
                    this.comboContainer.active = false;
                })
                .start();
        }
    }

    private playStartAnimation(): void {
        if (this.comboContainer) {
            tween(this.comboContainer)
                .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }

    private playUpdateAnimation(): void {
        if (this.comboContainer) {
            tween(this.comboContainer)
                .to(0.05, { scale: new Vec3(1.1, 1.1, 1) })
                .to(0.05, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }

    private playEndAnimation(): void {
        if (this.comboContainer && this.opacityComponent) {
            tween(this.comboContainer)
                .to(0.2, { scale: new Vec3(1.4, 1.4, 1) })
                .to(0.4, { scale: new Vec3(0.6, 0.6, 1) })
                .start();
            
            tween(this.opacityComponent)
                .to(0.2, { opacity: 255 })
                .to(0.4, { opacity: 0 })
                .call(() => {
                    this.scheduleOnce(() => {
                        this.hideCombo();
                    }, 0.1);
                })
                .start();
        }
    }
} 