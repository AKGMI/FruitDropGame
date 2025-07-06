import { IFallStrategy } from './IFallStrategy';
import { VelocityComponent } from '../../Core/ECS/Components/VelocityComponent';
import { PositionComponent } from '../../Core/ECS/Components/PositionComponent';
import { GameConstants } from '../../Core/Constants/GameConstants';

export class AcceleratedFallStrategy implements IFallStrategy {
    public applyStrategy(
        velocity: VelocityComponent,
        position: PositionComponent,
        deltaTime: number,
        parameters: Map<string, any>
    ): void {
        if (!parameters.has('initialVelocity')) {
            parameters.set('initialVelocity', velocity.y);
            
            const randomAcceleration = GameConstants.ACCELERATED_ACCELERATION * (0.5 + Math.random() * 1.0);
            parameters.set('acceleration', randomAcceleration);
            
            const randomMaxVelocity = GameConstants.ACCELERATED_MAX_VELOCITY * (0.75 + Math.random() * 0.5);
            parameters.set('maxVelocity', randomMaxVelocity);
        }

        const acceleration = parameters.get('acceleration');
        const maxVelocity = parameters.get('maxVelocity');
        
        velocity.y += acceleration * deltaTime;
        
        if (velocity.y < maxVelocity) {
            velocity.y = maxVelocity;
        }
    }
} 