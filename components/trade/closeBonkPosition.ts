import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import { PerpetualsClient } from "flash-sdk";
import { POOL_CONFIGS } from "@/utils/constants";
import { OraclePrice, PoolConfig, Privilege, Side } from "flash-sdk";
import { MarketInfo } from "./marketBonk";
import { fetchOraclePrice } from "../pythPricing/pythPricing";
import { marketInfo } from "./marketBonk";
import { BN } from "@coral-xyz/anchor";
import { getNftTradingAccountInfo } from './TradingAccountPk';


export async function closeBonkPosition(
    perpClient: PerpetualsClient,
    market: string,
    side: 'long' | 'short',
    userPublicKey: PublicKey,
    poolName: string
) {
    console.log('Closing Bonk Position')
    try {
        // Get market data
        const marketData = marketInfo[market] as MarketInfo[string];
        if (!marketData) {
          throw new Error(`Market data not found for ${market}`);
        }
    
        const [targetSymbol, collateralSymbol] = marketData.tokenPair.split('/');
    
        // Fetch oracle prices
        const targetTokenPriceEntry = await fetchOraclePrice(targetSymbol);
    
        // Create OraclePrice objects as expected by flash-sdk
        const targetOraclePrice: OraclePrice = targetTokenPriceEntry.price;    
        // Calculate position size based on USD amount and leverage
        const poolConfig = PoolConfig.fromIdsByName(poolName, 'mainnet-beta'); // instead of Crypto.1 this should be taken as a argument by the funtion when it is being called.
    
        // Calculate token amount (position size / token price)
    
        // Calculate price after slippage
        const slippageBpsBN = new BN(100); // 1% slippage, adjust as needed
        const sideEnum = side === 'long' ? Side.Long : Side.Short;
        const priceAfterSlippage = perpClient.getPriceAfterSlippage(
          false, // isEntry = false for closing position
          slippageBpsBN,
          targetOraclePrice,
          sideEnum
        );
    
        // Get nftTradingAccountPk and nftOwnerRebateTokenAccountPk using the new function
        const { nftTradingAccountPk, nftOwnerRebateTokenAccountPk } = await getNftTradingAccountInfo(
          userPublicKey,
          perpClient,
          poolConfig,
          collateralSymbol
        );
    
        if (!nftTradingAccountPk) {
          throw new Error('Failed to get nftTradingAccountPk');
        }
    
        if (!nftOwnerRebateTokenAccountPk) {
          throw new Error('Failed to get nftOwnerRebateTokenAccountPk');
        }
    
        // Get the nftReferralAccount
        const nftReferralAccount = PublicKey.findProgramAddressSync(
          [Buffer.from('referral'), userPublicKey.toBuffer()],
          POOL_CONFIGS[0].programId
        )[0];
    
        
        const privilege = Privilege.Referral;

        // Create close position instruction
        const { instructions, additionalSigners } = await perpClient.closePosition(
          targetSymbol,
          collateralSymbol,
          priceAfterSlippage,
          sideEnum,
          poolConfig,
          privilege,
          nftTradingAccountPk,
          nftReferralAccount,
          nftOwnerRebateTokenAccountPk,
        );
    
        // Set compute unit limit instruction
        const setCULimitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 });
    
        // Combine instructions
        const allInstructions = [setCULimitIx, ...instructions];
    
        return {
          instructions: allInstructions,
          additionalSigners,
          alts: perpClient.addressLookupTables,
        };
      } catch (error) {
        console.error('Error creating close position instruction:', error);
        throw error;
      }
    

};
