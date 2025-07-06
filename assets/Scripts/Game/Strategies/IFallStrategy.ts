import { VelocityComponent } from '../../Core/ECS/Components/VelocityComponent';
import { PositionComponent } from '../../Core/ECS/Components/PositionComponent';

export interface IFallStrategy {
    applyStrategy(
        velocity: VelocityComponent, 
        position: PositionComponent, 
        deltaTime: number, 
        parameters: Map<string, any>
    ): void;
} 