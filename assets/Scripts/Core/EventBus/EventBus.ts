export class EventBus {
    private static instance: EventBus;
    private events: Map<string, Function[]> = new Map();

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public static emit(event: string, data?: any): void {
        EventBus.getInstance().emitEvent(event, data);
    }

    public static on(event: string, callback: Function): void {
        EventBus.getInstance().addEventListener(event, callback);
    }

    public static off(event: string, callback: Function): void {
        EventBus.getInstance().removeEventListener(event, callback);
    }

    public static clear(): void {
        EventBus.getInstance().clearAll();
    }

    private emitEvent(event: string, data?: any): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    private addEventListener(event: string, callback: Function): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    private removeEventListener(event: string, callback: Function): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private clearAll(): void {
        this.events.clear();
    }
} 