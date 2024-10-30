export interface MarketInfo {
  [key: string]: {
    tokenPair: string;
    side: string;
    pool: string;
  };
}

export const marketInfo: MarketInfo = {
  "DvvnSEZueicT9UN9WMvfYP3B4NQDgiNjjtbKLenLakxv": {
    tokenPair: "BONK/BONK",
    side: "long",
    pool: "Community.1",
  },
  "3EYDn8VkY19QBStG4QtvLAdPScReLS7kuchhterF7ADP": {
    tokenPair: "BONK/USDC",
    side: "short",
    pool: "Community.1",
  },
};