import { BaseComponent } from '../BaseComponent';

export class CollectibleComponent extends BaseComponent {
    public static readonly componentName = 'CollectibleComponent';
    
    public collected: boolean = false;
    public collectTime: number = 0;

    constructor() {
        super();
    }

    public markCollected(): void {
        this.collected = true;
        this.collectTime = Date.now();
    }

    public isCollected(): boolean {
        return this.collected;
    }
} 