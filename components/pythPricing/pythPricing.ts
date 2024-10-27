import { PriceServiceConnection, PriceFeed } from "@pythnetwork/price-service-client";
import { OraclePrice } from 'flash-sdk';
import { BN } from '@coral-xyz/anchor';
import { ALL_TOKENS, PRICE_FEED_IDS } from '@/utils/constants';

const HERMES_URL = "https://hermes.pyth.network";

// We'll focus only on BONK
const TOKEN_PRICE_FEED_ID = PRICE_FEED_IDS['BONK'];

const priceServiceConnection = new PriceServiceConnection(HERMES_URL, {
  priceFeedRequestConfig: {
    binary: true, // Set to true for on-chain use
  },
});

export interface PythPriceEntry {
  price: OraclePrice;
  emaPrice: OraclePrice;
  isStale: boolean;
  status: PriceStatus;
}

export enum PriceStatus {
  Trading,
  Unknown,
  Halted,
  Auction,
}

export function subscribeToPriceFeeds(callback: (symbol: string, priceEntry: PythPriceEntry) => void) {
  priceServiceConnection.subscribePriceFeedUpdates([TOKEN_PRICE_FEED_ID], (priceFeed) => {
    console.log("Received price feed update for BONK");
    const pythPriceEntry = createPythPriceEntry(priceFeed, 'BONK');
    callback('BONK', pythPriceEntry);
  });
}

export function unsubscribeFromPriceFeeds() {
  priceServiceConnection.closeWebSocket();
}

export async function getLatestPrice(): Promise<PythPriceEntry | null> {
  try {
    const priceFeed = await priceServiceConnection.getLatestPriceFeeds([TOKEN_PRICE_FEED_ID]);
    
    if (!priceFeed || priceFeed.length === 0) {
      console.error(`No price feed received for BONK`);
      return null;
    }

    return createPythPriceEntry(priceFeed[0], 'BONK');
  } catch (error) {
    console.error(`Error fetching latest price for BONK:`, error);
    return null;
  }
}

function createPythPriceEntry(priceFeed: PriceFeed, symbol: string): PythPriceEntry {
  const price = priceFeed.getPriceUnchecked();
  const emaPrice = priceFeed.getEmaPriceUnchecked();

  const priceOracle = new OraclePrice({
    price: new BN(price.price),
    exponent: new BN(price.expo),
    confidence: new BN(price.conf),
    timestamp: new BN(price.publishTime),
  });

  const emaPriceOracle = new OraclePrice({
    price: new BN(emaPrice.price),
    exponent: new BN(emaPrice.expo),
    confidence: new BN(emaPrice.conf),
    timestamp: new BN(emaPrice.publishTime),
  });

  const token = ALL_TOKENS.find(t => t.pythPriceId.toLowerCase() === priceFeed.id.toLowerCase());
  const status = token && !token.isVirtual ? PriceStatus.Trading : PriceStatus.Unknown;

  return {
    price: priceOracle,
    emaPrice: emaPriceOracle,
    isStale: false, // You may want to implement a staleness check based on your requirements
    status: status,
  };
}