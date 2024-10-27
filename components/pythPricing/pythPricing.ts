import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import { OraclePrice } from 'flash-sdk';
import { BN } from '@coral-xyz/anchor';
import { ALL_TOKENS, HERMES_URL } from '@/utils/constants';


// Create a map of symbol to Pyth price ID
const PRICE_FEED_IDS = ALL_TOKENS.reduce((acc, token) => {
  acc[token.symbol] = token.pythPriceId;
  return acc;
}, {} as { [key: string]: string });

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

export const fetchOraclePrice = async (symbol: string): Promise<PythPriceEntry> => {
  // console.log (`Starting fetchOraclePrice for symbol: ${symbol}`);

  const priceFeedId = PRICE_FEED_IDS[symbol];
  if (!priceFeedId) {
    throw new Error(`Price feed ID not found for symbol: ${symbol}`);
  }

  try {
    const priceFeed = await priceServiceConnection.getLatestPriceFeeds([priceFeedId]);
    
    if (!priceFeed || priceFeed.length === 0) {
      throw new Error(`No price feed received for ${symbol}`);
    }

    const price = priceFeed[0].getPriceUnchecked();
    const emaPrice = priceFeed[0].getEmaPriceUnchecked();

    // console.log (`Raw price data for ${symbol}:`, price);
    // console.log (`Raw EMA price data for ${symbol}:`, emaPrice);

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

    const token = ALL_TOKENS.find(t => t.pythPriceId === priceFeedId);
    if (!token) {
      throw new Error(`Token not found for price feed ID: ${priceFeedId}`);
    }

    const status = !token.isVirtual ? PriceStatus.Trading : PriceStatus.Unknown;

    const pythPriceEntry: PythPriceEntry = {
      price: priceOracle,
      emaPrice: emaPriceOracle,
      isStale: false,
      status: status,
    };

    // console.log (`Pyth price entry for ${symbol}:`, pythPriceEntry);
    return pythPriceEntry;
  } catch (error) {
    console.error(`Error in fetchOraclePrice for ${symbol}:`, error);
    throw error;
  }
};

// If you need to get all price IDs for subscription or other purposes
export const getAllPriceIds = () => ALL_TOKENS.map((t) => t.pythPriceId);

export const subscribeToPriceFeeds = (callback: (symbol: string, priceEntry: PythPriceEntry) => void) => {
  const priceIds = getAllPriceIds();
  priceServiceConnection.subscribePriceFeedUpdates(priceIds, (priceFeed) => {
    const token = ALL_TOKENS.find((f) => f.pythPriceId === `0x${priceFeed.id}`);
    if (token) {
      const priceOracle = new OraclePrice({
        price: new BN(priceFeed.getPriceUnchecked().price),
        exponent: new BN(priceFeed.getPriceUnchecked().expo),
        confidence: new BN(priceFeed.getPriceUnchecked().conf),
        timestamp: new BN(priceFeed.getPriceUnchecked().publishTime),
      });
      const emaPriceOracle = new OraclePrice({
        price: new BN(priceFeed.getEmaPriceUnchecked().price),
        exponent: new BN(priceFeed.getEmaPriceUnchecked().expo),
        confidence: new BN(priceFeed.getEmaPriceUnchecked().conf),
        timestamp: new BN(priceFeed.getEmaPriceUnchecked().publishTime),
      });

      const status = !token.isVirtual ? PriceStatus.Trading : PriceStatus.Unknown;
      const priceEntry: PythPriceEntry = {
        price: priceOracle,
        emaPrice: emaPriceOracle,
        isStale: false,
        status: status,
      };
      callback(token.symbol, priceEntry);
    }
  });
};
