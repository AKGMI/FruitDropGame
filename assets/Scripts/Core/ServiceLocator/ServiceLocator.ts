export class ServiceLocator {
    private static instance: ServiceLocator;
    private services: Map<string, any> = new Map();

    public static getInstance(): ServiceLocator {
        if (!ServiceLocator.instance) {
            ServiceLocator.instance = new ServiceLocator();
        }
        return ServiceLocator.instance;
    }

    public static register<T>(key: string, service: T): void {
        ServiceLocator.getInstance().registerService(key, service);
    }

    public static get<T>(key: string): T | undefined {
        return ServiceLocator.getInstance().getService<T>(key);
    }

    public static has(key: string): boolean {
        return ServiceLocator.getInstance().hasService(key);
    }

    public static unregister(key: string): void {
        ServiceLocator.getInstance().unregisterService(key);
    }

    public static clear(): void {
        ServiceLocator.getInstance().clearAll();
    }

    private registerService<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    private getService<T>(key: string): T | undefined {
        return this.services.get(key);
    }

    private hasService(key: string): boolean {
        return this.services.has(key);
    }

    private unregisterService(key: string): void {
        this.services.delete(key);
    }

    private clearAll(): void {
        this.services.clear();
    }
} 