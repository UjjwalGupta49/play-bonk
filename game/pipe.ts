import { Texture, Sprite, Container } from 'pixi.js'
import constants from './constants'
import { CandleData } from './services/PriceBufferService'
import BigNumber from 'bignumber.js'

class Pipe extends Container {
    private topHalf: Sprite;
    private bottomHalf: Sprite;
    private candleData: CandleData;

    public readonly pipeWidth = 80;
    public readonly pipeGap = 200;
    private readonly baseHeight = 300; // Adjusted base height for better visualization
    private readonly minHeight = 50;   // Minimum height for playability

    constructor(graphic: Texture, candleData: CandleData) {
        super();
        this.candleData = candleData;

        this.topHalf = new Sprite(graphic);
        this.bottomHalf = new Sprite(graphic);

        // Set anchors for proper positioning
        this.bottomHalf.anchor.set(0, 0);
        this.topHalf.anchor.set(0, 0);
        
        // Calculate heights based on price movement
        const [topHeight, bottomHeight] = this.calculatePipeHeights();

        // Set dimensions
        this.topHalf.height = topHeight;
        this.bottomHalf.height = bottomHeight;
        this.topHalf.width = this.pipeWidth;
        this.bottomHalf.width = this.pipeWidth;

        // Set color based on price movement (green for up, red for down)
        const tint = this.candleData.close >= this.candleData.open ? 0x00FF00 : 0x00FF00 ;
        this.topHalf.tint = tint;
        this.bottomHalf.tint = tint;

        this.addChild(this.bottomHalf);
        this.addChild(this.topHalf);

        // Position pipes
        this.x = constants['gameWidth'];
        this.topHalf.y = 0;
        this.bottomHalf.y = constants['gameHeight'] - bottomHeight;
    }

    private calculatePipeHeights(): [number, number] {
        // Configure BigNumber for 5 decimal places
        BigNumber.config({ 
            DECIMAL_PLACES: 5, 
            ROUNDING_MODE: BigNumber.ROUND_HALF_UP 
        });
        
        // Calculate price movement percentages using BigNumber
        const priceChangePercent = new BigNumber(this.candleData.close)
            .minus(this.candleData.open)
            .dividedBy(this.candleData.open)
            .abs()
            .multipliedBy(100)
            .toNumber();
        
        // Scale factor for converting percentage to pixels
        const scaleFactor = this.baseHeight / 0.1;
        
        let topHeight, bottomHeight;
        
        if (this.candleData.close < this.candleData.open) {
            // Price decreased - make top pipe taller
            topHeight = Math.max(
                this.minHeight,
                this.baseHeight + (priceChangePercent * scaleFactor)
            );
            // Set bottom height to fill remaining space
            bottomHeight = constants['gameHeight'] - (topHeight + this.pipeGap);
        } else {
            // Price increased - make bottom pipe taller
            bottomHeight = Math.max(
                this.minHeight,
                this.baseHeight + (priceChangePercent * scaleFactor)
            );
            // Set top height to fill remaining space
            topHeight = constants['gameHeight'] - (bottomHeight + this.pipeGap);
        }

        // Ensure heights don't go below minimum
        topHeight = Math.max(topHeight, this.minHeight);
        bottomHeight = Math.max(bottomHeight, this.minHeight);

        return [topHeight, bottomHeight];
    }

    public updatePosition(delta: number) {
        this.x -= constants['moveSpeed'] * delta;
    }

    public getTopPipeBounds() {
        return this.topHalf.getBounds();
    }

    public getBottomPipeBounds() {
        return this.bottomHalf.getBounds();
    }
}

export { Pipe };
