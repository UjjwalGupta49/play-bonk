import { BN } from "@coral-xyz/anchor";
import { PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import {
  fetchOraclePrice,
  PythPriceEntry,
} from "@/components/pythPricing/pythPricing";
import { ALL_TOKENS, ALL_CUSTODIES } from "@/utils/constants";
import { marketInfo, MarketInfo } from "./marketBonk";
import { getNftTradingAccountInfo } from "./TradingAccountPk";
import {
  PerpetualsClient,
  OraclePrice,
  PoolConfig,
  Privilege,
  Side,
  CustodyAccount,
  Custody,
} from "flash-sdk";

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

export async function openBonkPosition(
  perpClient: PerpetualsClient,
  market: string,
  side: "long" | "short",
  collateralUsd: number,
  leverage: number,
  userPublicKey: PublicKey,
  poolName: string
) {
  console.log("Opening Bonk Position");
  try {
    const marketData = marketInfo[market] as MarketInfo[string];
    if (!marketData) {
      throw new Error(`Market data not found for ${market}`);
    }

    const [targetSymbol, collateralSymbol] = marketData.tokenPair.split("/");

    const targetToken = ALL_TOKENS.find((t) => t.symbol === targetSymbol);
    const collateralToken = ALL_TOKENS.find(
      (t) => t.symbol === collateralSymbol
    );

    if (!targetToken || !collateralToken) {
      throw new Error("Token not found");
    }

    const targetTokenPriceEntry: PythPriceEntry = await fetchOraclePrice(
      targetSymbol
    );
    const collateralTokenPriceEntry: PythPriceEntry = await fetchOraclePrice(
      collateralSymbol
    );

    const targetOraclePrice: OraclePrice = targetTokenPriceEntry.price;
    const collateralOraclePrice: OraclePrice = collateralTokenPriceEntry.price;

    // Convert collateral token price to number
    const collateralTokenPrice =
      hexToNumber(collateralOraclePrice.price.toString("hex")) *
      Math.pow(10, hexToNumber(collateralOraclePrice.exponent.toString("hex")));

    const poolConfig = PoolConfig.fromIdsByName(poolName, "mainnet-beta");

    const leverageBN = new BN(leverage);
    const collateralAmountNew = new BN(
      (collateralUsd / collateralTokenPrice) * 10 ** collateralToken.decimals
    ); //10/137 = 0.07299270072992701

    console.log(`Leverage: ${leverage}`);
    console.log(
      `Calculated collateral amount (New): ${collateralAmountNew} Token`
    ); // 0.07 SOL
    console.log(`Target oracle price: ${targetOraclePrice.toUiPrice}`);

    // Fetch custody accounts
    const targetCustodyConfig = poolConfig.custodies.find(
      (c) => c.symbol === targetSymbol
    );
    const collateralCustodyConfig = poolConfig.custodies.find(
      (c) => c.symbol === collateralSymbol
    );
    if (!targetCustodyConfig || !collateralCustodyConfig) {
      throw new Error("Custody config not found");
    }

    // Fetch actual CustodyAccount objects
    const allAccounts =
      await perpClient.provider.connection.getMultipleAccountsInfo(
        ALL_CUSTODIES.map((custody) => custody.custodyAccount)
      );

    let targetCustodyAccount: CustodyAccount | undefined;
    let collateralCustodyAccount: CustodyAccount | undefined;

    ALL_CUSTODIES.forEach((custody, index) => {
      const accountInfo = allAccounts[index];
      if (accountInfo) {
        const custodyData = perpClient.program.coder.accounts.decode<Custody>(
          "custody",
          accountInfo.data
        );
        const custodyAccountObj = CustodyAccount.from(
          custody.custodyAccount,
          custodyData
        );

        if (custody.custodyAccount.equals(targetCustodyConfig.custodyAccount)) {
          targetCustodyAccount = custodyAccountObj;
        }
        if (
          custody.custodyAccount.equals(collateralCustodyConfig.custodyAccount)
        ) {
          collateralCustodyAccount = custodyAccountObj;
        }
      }
    });

    if (!targetCustodyAccount || !collateralCustodyAccount) {
      throw new Error("Custody account not found");
    }

    if (!targetToken || !collateralToken) {
      throw new Error("Token not found");
    }

    const sideEnum = side === "long" ? Side.Long : Side.Short;

    // just take the collateral and pass it to getSizeAmountFromLeverageAndCollateral
    // Calculate tokenAmountBN using getSizeAmountFromLeverageAndCollateral
    const tokenAmountBN = perpClient.getSizeAmountFromLeverageAndCollateral(
      collateralAmountNew,
      leverageBN.toString(),
      targetToken,
      collateralToken,
      sideEnum,
      targetOraclePrice,
      targetOraclePrice,
      targetCustodyAccount,
      collateralOraclePrice,
      collateralOraclePrice,
      collateralCustodyAccount
    );
    console.log(
      `Calculated token amount (lamports): ${tokenAmountBN.toString()} (${tokenAmountBN
        .div(new BN(10).pow(new BN(9)))
        .toString()} SOL)`
    );
    console.log(
      `Calculated token amount (SOL): ${tokenAmountBN
        .div(new BN(10).pow(new BN(9)))
        .toString()}`
    );

    const slippageBpsBN = new BN(1000);
    const priceAfterSlippage = perpClient.getPriceAfterSlippage(
      true,
      slippageBpsBN,
      targetOraclePrice,
      sideEnum
    );

    const {
      nftReferralAccountPK,
      nftTradingAccountPk,
      nftOwnerRebateTokenAccountPk,
    } = await getNftTradingAccountInfo(
      userPublicKey,
      perpClient,
      poolConfig,
      collateralSymbol
    );

    if (
      !nftTradingAccountPk ||
      !nftReferralAccountPK ||
      !nftOwnerRebateTokenAccountPk
    ) {
      throw new Error("Failed to get required NFT account information");
    }

    const privilege = Privilege.Referral;

    const { instructions, additionalSigners } = await perpClient.openPosition(
      targetSymbol,
      collateralSymbol,
      priceAfterSlippage,
      collateralAmountNew,
      tokenAmountBN,
      sideEnum,
      poolConfig,
      privilege,
      nftTradingAccountPk,
      nftReferralAccountPK,
      nftOwnerRebateTokenAccountPk,
      false // skipBalanceCheck
    );

    const setCULimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600_000,
    });

    const allInstructions = [setCULimitIx, ...instructions];

    return {
      instructions: allInstructions,
      additionalSigners,
      alts: perpClient.addressLookupTables,
    };
  } catch (error) {
    console.error("Error creating open position instruction:", error);
    throw error;
  }
}
