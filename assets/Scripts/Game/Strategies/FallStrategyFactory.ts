import { IFallStrategy } from './IFallStrategy';
import { StraightFallStrategy } from './StraightFallStrategy';
import { ZigzagFallStrategy } from './ZigzagFallStrategy';
import { AcceleratedFallStrategy } from './AcceleratedFallStrategy';
import { FallStrategyType } from '../../Core/ECS/Components/FallStrategyComponent';

export class FallStrategyFactory {
    public static createStrategy(strategyType: FallStrategyType): IFallStrategy {
        switch (strategyType) {
            case FallStrategyType.STRAIGHT:
                return new StraightFallStrategy();
            case FallStrategyType.ZIGZAG:
                return new ZigzagFallStrategy();
            case FallStrategyType.ACCELERATED:
                return new AcceleratedFallStrategy();
            default:
                console.warn(`Unknown fall strategy type: ${strategyType}. Using straight fall.`);
                return new StraightFallStrategy();
        }
    }
} 