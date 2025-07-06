import { IFallStrategy } from './IFallStrategy';
import { VelocityComponent } from '../../Core/ECS/Components/VelocityComponent';
import { PositionComponent } from '../../Core/ECS/Components/PositionComponent';
import { GameConstants } from '../../Core/Constants/GameConstants';

export class ZigzagFallStrategy implements IFallStrategy {
    
    public applyStrategy(
        velocity: VelocityComponent,
        position: PositionComponent,
        deltaTime: number,
        parameters: Map<string, any>
    ): void {
        if (!parameters.has('startTime')) {
            parameters.set('startTime', Date.now());
            
            const randomAmplitude = GameConstants.ZIGZAG_AMPLITUDE * (0.5 + Math.random() * 1.0);
            parameters.set('amplitude', randomAmplitude);
            
            const randomFrequency = GameConstants.ZIGZAG_FREQUENCY * (0.5 + Math.random() * 1.0);
            parameters.set('frequency', randomFrequency);
        }

        const startTime = parameters.get('startTime');
        const amplitude = parameters.get('amplitude');
        const frequency = parameters.get('frequency');
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        const horizontalVelocity = amplitude * Math.sin(elapsedTime * frequency * Math.PI);
        
        velocity.x = horizontalVelocity;
    }
} 