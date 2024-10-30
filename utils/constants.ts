import { Cluster, Connection } from "@solana/web3.js";
import { PoolConfig, Token } from "flash-sdk";
import { Keypair } from '@solana/web3.js'
import {AnchorProvider, Wallet} from "@coral-xyz/anchor"; 
import bs58 from 'bs58';
import { PerpetualsClient } from 'flash-sdk'

export const RPC = "https://flashtr-flash-885f.mainnet.rpcpool.com/11a75a74-fd8e-44cc-87f4-d84bb82d0983";


export const HERMES_URL: string = "https://hermes.pyth.network";

export const POOL_NAMES = [
  "Crypto.1",
  "Virtual.1",
  "Governance.1",
  "Community.1",
  "Community.2",
];

const DEFAULT_CLUSTER: Cluster = "mainnet-beta";

export const POOL_CONFIGS = POOL_NAMES.map((f) =>
  PoolConfig.fromIdsByName(f, DEFAULT_CLUSTER)
);

export const PROGRAM_ID = POOL_CONFIGS[0].programId;

const DUPLICATE_TOKENS = POOL_CONFIGS.map((f) => f.tokens).flat();
const tokenMap = new Map();
for (const token of DUPLICATE_TOKENS) {
  tokenMap.set(token.symbol, token);
}
export const ALL_TOKENS: Token[] = Array.from(tokenMap.values());
export const ALL_CUSTODIES = POOL_CONFIGS.map((f) => f.custodies).flat();
export const ALL_MARKET_CONFIGS = POOL_CONFIGS.map((f) => f.markets).flat();

export const PRICE_FEED_IDS = ALL_TOKENS.reduce((acc, token) => {
  // Ensure the pythPriceId is always in the format with '0x' prefix
  const formattedId = token.pythPriceId.startsWith("0x")
    ? token.pythPriceId
    : `0x${token.pythPriceId}`;
  acc[token.symbol] = formattedId;
  return acc;
}, {} as { [key: string]: string });


