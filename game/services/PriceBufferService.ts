import { PythPriceEntry, subscribeToPriceFeeds, unsubscribeFromPriceFeeds } from '@/components/pythPricing/pythPricing';

export interface CandleData {
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: number;
}

export class PriceBufferService {
    private static instance: PriceBufferService;
    private priceBuffer: number[] = [];
    private candleBuffer: CandleData[] = [];
    private subscribers: ((candle: CandleData) => void)[] = [];
    
    // Buffer period in milliseconds (2 seconds)
    private readonly BUFFER_PERIOD = 1000;
    private currentCandleStartTime: number = Date.now();

    private constructor() {
        this.initializePriceSubscription();
    }

    public static getInstance(): PriceBufferService {
        if (!PriceBufferService.instance) {
            PriceBufferService.instance = new PriceBufferService();
        }
        return PriceBufferService.instance;
    }

    private initializePriceSubscription() {
        subscribeToPriceFeeds((symbol, priceEntry) => {
            const price = this.convertPriceToNumber(priceEntry);
            this.addPrice(price);
        });
    }

    private convertPriceToNumber(priceEntry: PythPriceEntry): number {
        // Convert price from PythPriceEntry to number
        return Number(priceEntry.price.price) * Math.pow(10, Number(priceEntry.price.exponent));
    }

    private addPrice(price: number) {
        const currentTime = Date.now();
        this.priceBuffer.push(price);

        // Check if it's time to create a new candle
        if (currentTime - this.currentCandleStartTime >= this.BUFFER_PERIOD) {
            this.createNewCandle();
        }
    }

    private createNewCandle() {
        if (this.priceBuffer.length === 0) return;

        const candle: CandleData = {
            open: this.priceBuffer[0],
            high: Math.max(...this.priceBuffer),
            low: Math.min(...this.priceBuffer),
            close: this.priceBuffer[this.priceBuffer.length - 1],
            timestamp: this.currentCandleStartTime
        };

        // Calculate percentage change for logging
        const percentChange = ((candle.close - candle.open) / candle.open) * 100;
        console.log(`New candle: ${percentChange.toFixed(2)}% change`);

        this.candleBuffer.push(candle);
        if (this.candleBuffer.length > 10) {
            this.candleBuffer.shift();
        }

        // Notify subscribers
        this.subscribers.forEach(callback => callback(candle));

        // Reset for next candle
        this.priceBuffer = [];
        this.currentCandleStartTime = Date.now();
    }

    public subscribe(callback: (candle: CandleData) => void) {
        this.subscribers.push(callback);
        
        // If there's an existing candle, immediately notify the new subscriber
        const latestCandle = this.getLatestCandle();
        if (latestCandle) {
            callback(latestCandle);
        }
    }

    public unsubscribe(callback: (candle: CandleData) => void) {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }

    public getLatestCandle(): CandleData | null {
        return this.candleBuffer[this.candleBuffer.length - 1] || null;
    }

    public getCandleBuffer(): CandleData[] {
        return [...this.candleBuffer];
    }

    public cleanup() {
        unsubscribeFromPriceFeeds();
        this.subscribers = [];
        this.priceBuffer = [];
        this.candleBuffer = [];
    }
}
