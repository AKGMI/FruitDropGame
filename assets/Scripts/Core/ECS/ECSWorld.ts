import { BaseSystem } from './BaseSystem';

export class ECSWorld {
    private static instance: ECSWorld;
    private entities: Map<number, Set<string>> = new Map();
    private components: Map<string, Map<number, any>> = new Map();
    private systems: BaseSystem[] = [];
    private nextEntityId: number = 1;

    public static getInstance(): ECSWorld {
        if (!ECSWorld.instance) {
            ECSWorld.instance = new ECSWorld();
        }
        return ECSWorld.instance;
    }

    public createEntity(): number {
        const id = this.nextEntityId++;
        this.entities.set(id, new Set());
        return id;
    }

    public destroyEntity(entityId: number): void {
        if (!this.entities.has(entityId)) {
            console.warn(`Entity ${entityId} already destroyed or doesn't exist`);
            return;
        }

        const componentTypes = this.entities.get(entityId)!;
        componentTypes.forEach(type => {
            this.components.get(type)?.delete(entityId);
        });
        this.entities.delete(entityId);
    }

    public addComponent<T>(entityId: number, component: T): void {
        let typeName: string;
        
        if ((component as any).constructor.componentName) {
            typeName = (component as any).constructor.componentName;
        } else {
            typeName = (component as any).constructor.name;
        }
        
        if (!this.components.has(typeName)) {
            this.components.set(typeName, new Map());
        }
        
        this.components.get(typeName)!.set(entityId, component);
        this.entities.get(entityId)?.add(typeName);
    }

    public removeComponent(entityId: number, componentType: string): void {
        this.components.get(componentType)?.delete(entityId);
        this.entities.get(entityId)?.delete(componentType);
    }

    public getComponent<T>(entityId: number, componentType: string): T | undefined {
        return this.components.get(componentType)?.get(entityId);
    }

    public hasComponent(entityId: number, componentType: string): boolean {
        return this.entities.get(entityId)?.has(componentType) || false;
    }

    public getEntitiesWith(componentTypes: string[]): number[] {
        const result: number[] = [];
        
        for (const [entityId, entityComponents] of this.entities) {
            const hasAllComponents = componentTypes.every(type => 
                entityComponents.has(type)
            );
            
            if (hasAllComponents) {
                result.push(entityId);
            }
        }
        
        return result;
    }

    public addSystem(system: BaseSystem): void {
        this.systems.push(system);
        system.onLoad();
    }

    public removeSystem(system: BaseSystem): void {
        const index = this.systems.indexOf(system);
        if (index > -1) {
            this.systems.splice(index, 1);
        }
    }

    public update(deltaTime: number): void {
        this.systems.forEach(system => {
            if (system.enabled) {
                system.update(deltaTime);
            }
        });
    }

    public getEntityCount(): number {
        return this.entities.size;
    }

    public getComponentCount(componentType: string): number {
        return this.components.get(componentType)?.size || 0;
    }

    public clear(): void {
        this.entities.clear();
        this.components.clear();
        this.systems.forEach(system => system.onDestroy());
        this.systems.length = 0;
        this.nextEntityId = 1;
    }

    public hasEntity(entityId: number): boolean {
        return this.entities.has(entityId);
    }
} 