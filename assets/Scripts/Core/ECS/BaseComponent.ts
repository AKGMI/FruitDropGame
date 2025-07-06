export abstract class BaseComponent {
    public static readonly componentName: string;
    public entityId: number;

    constructor(entityId?: number) {
        this.entityId = entityId || 0;
    }
} 