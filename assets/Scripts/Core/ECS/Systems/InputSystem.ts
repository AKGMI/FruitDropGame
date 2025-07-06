import { BaseSystem } from '../BaseSystem';
import { PositionComponent } from '../Components/PositionComponent';
import { VelocityComponent } from '../Components/VelocityComponent';
import { input, Input, EventMouse, EventTouch, view } from 'cc';

export class InputSystem extends BaseSystem {
    private currentMouseX: number = 0;
    private isMousePressed: boolean = false;

    public onLoad(): void {
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    public onDestroy(): void {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onMouseMove(event: EventMouse): void {
        const mousePos = event.getUILocation();
        this.currentMouseX = mousePos.x;
    }

    private onMouseDown(event: EventMouse): void {
        this.isMousePressed = true;
        const mousePos = event.getUILocation();
        this.currentMouseX = mousePos.x;
    }

    private onMouseUp(event: EventMouse): void {
        this.isMousePressed = false;
    }

    private onTouchStart(event: EventTouch): void {
        this.isMousePressed = true;
        const touchPos = event.getUILocation();
        this.currentMouseX = touchPos.x;
    }

    private onTouchMove(event: EventTouch): void {
        const touchPos = event.getUILocation();
        this.currentMouseX = touchPos.x;
    }

    private onTouchEnd(event: EventTouch): void {
        this.isMousePressed = false;
    }

    private onTouchCancel(event: EventTouch): void {
        this.isMousePressed = false;
    }

    public update(deltaTime: number): void {
        const basketEntities = this.world.getEntitiesWith(['BasketComponent', 'PositionComponent', 'VelocityComponent']);
        
        basketEntities.forEach(entityId => {
            const position = this.world.getComponent<PositionComponent>(entityId, 'PositionComponent');
            const velocity = this.world.getComponent<VelocityComponent>(entityId, 'VelocityComponent');
            
            if (position && velocity) {
                position.x = this.currentMouseX;
                velocity.x = 0;
            }
        });
    }
} 