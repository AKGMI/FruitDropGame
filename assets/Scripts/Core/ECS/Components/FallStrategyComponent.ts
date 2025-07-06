import { BaseComponent } from '../BaseComponent';

export enum FallStrategyType {
    STRAIGHT = 'straight',
    ZIGZAG = 'zigzag',
    ACCELERATED = 'accelerated'
}

export class FallStrategyComponent extends BaseComponent {
    public static readonly componentName = 'FallStrategyComponent';

    public strategyType: FallStrategyType;
    public parameters: Map<string, any>;

    constructor(strategyType: FallStrategyType = FallStrategyType.STRAIGHT) {
        super();
        this.strategyType = strategyType;
        this.parameters = new Map<string, any>();
    }

    public setParameter(key: string, value: any): void {
        this.parameters.set(key, value);
    }

    public getParameter(key: string): any {
        return this.parameters.get(key);
    }

    public hasParameter(key: string): boolean {
        return this.parameters.has(key);
    }
} 