export abstract class BaseComponent {
    public entityId: number;

    constructor(entityId?: number) {
        this.entityId = entityId || 0;
    }
} 