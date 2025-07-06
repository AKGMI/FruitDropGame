import { Component, _decorator, Node } from 'cc';
import { GameManager } from './GameManager';
import { BasketViewController } from '../Controllers/Game/BasketViewController';
import { FruitViewController } from '../Controllers/Game/FruitViewController';

const { ccclass, property } = _decorator;

@ccclass('SceneSetup')
export class SceneSetup extends Component {
    @property(GameManager)
    gameManager: GameManager = null!;
    
    @property(BasketViewController)
    basketController: BasketViewController = null!;
    
    @property(FruitViewController)
    fruitController: FruitViewController = null!;

    onLoad(): void {
        this.initializeScene();
    }

    private initializeScene(): void {
        if (this.gameManager) {
            this.gameManager.startGame();
        }
    }

    public getGameManager(): GameManager {
        return this.gameManager;
    }

    public getBasketController(): BasketViewController {
        return this.basketController;
    }

    public getFruitController(): FruitViewController {
        return this.fruitController;
    }
} 