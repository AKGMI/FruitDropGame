import { PositionComponent } from '../../Core/ECS/Components/PositionComponent';
import { VelocityComponent } from '../../Core/ECS/Components/VelocityComponent';
import { IFallStrategy } from './IFallStrategy';

export class StraightFallStrategy implements IFallStrategy {
    private baseSpeed: number;

    constructor(baseSpeed: number = 150) {
        this.baseSpeed = baseSpeed;
    }

    public applyStrategy(
        velocity: VelocityComponent,
        position: PositionComponent,
        deltaTime: number,
        parameters: Map<string, any>
    ): void {
        if (!parameters.has('initialized')) {
            parameters.set('initialized', true);
            
            const randomDrift = (Math.random() - 0.5) * 40;
            parameters.set('horizontalDrift', randomDrift);
            
            const speedVariation = 1.0 + (Math.random() - 0.5) * 0.2;
            parameters.set('speedMultiplier', speedVariation);
        }

        const horizontalDrift = parameters.get('horizontalDrift');
        const speedMultiplier = parameters.get('speedMultiplier');
        
        velocity.y = -this.baseSpeed * speedMultiplier;
        velocity.x = horizontalDrift;
    }

    public updateVelocity(
        position: PositionComponent,
        velocity: VelocityComponent,
        deltaTime: number,
        age: number
    ): void {
        velocity.setVelocity(0, -this.baseSpeed);
    }
} 