"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Image from "next/image";
import Game from "@/components/Game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import state from "@/game/gameState";
import bonkTokenImage from "@/public/bonkToken.jpg";
import {
  PythPriceEntry,
  subscribeToPriceFeeds,
  unsubscribeFromPriceFeeds,
} from "@/components/pythPricing/pythPricing";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { openBonkPosition } from "@/components/trade/openBonkPosition";
import { closeBonkPosition } from "@/components/trade/closeBonkPosition";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { PerpetualsClient } from "flash-sdk";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import { POOL_CONFIGS } from "@/utils/constants";
import { marketInfo } from "@/components/trade/marketBonk";
import { createAndExecuteTransaction } from "@/components/trade/createAndExecuteTransaction";
import { GameOver } from "@/components/Game/GameOver";
import { motion } from "framer-motion";

const getInitialHighScore = () => {
  if (typeof window !== 'undefined') {
    const savedHighScore = localStorage.getItem('highestPnl');
    return savedHighScore ? parseFloat(savedHighScore) : 0;
  }
  return 0;
};

const Home: NextPage = () => {
  const { publicKey, connect, wallets, select } = useWallet();
  const { connection } = useConnection();
  const [positionPrice, setPositionPrice] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [priceChange, setPriceChange] = useState<"up" | "down" | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const { toast } = useToast();
  const wallet = useAnchorWallet();
  const [flashPerpClient, setFlashPerpClient] =
    useState<PerpetualsClient | null>(null);
  const [isPlayerDead, setIsPlayerDead] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [highestPnl, setHighestPnl] = useState(getInitialHighScore);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [isTransactionExecuting, setIsTransactionExecuting] = useState(false);

  useEffect(() => {
    let lastPrice = 0;

    subscribeToPriceFeeds((symbol, priceEntry: PythPriceEntry) => {
      if (priceEntry.price && !priceEntry.isStale) {
        const price = priceEntry.price.price * 10 ** priceEntry.price.exponent;
        setTokenPrice(price);
        setPriceChange(price > lastPrice ? "up" : "down");
        lastPrice = price;

        // Calculate PNL if position is open
        if (state.isPositionOpen && positionPrice !== 0) {
          let pnlValue = 0;

          if (state.position === "MOON") {
            // For long positions: (currentPrice - entryPrice) * position size
            pnlValue = (price - positionPrice) * collateralAmount;
            console.log("pnlValue");
            console.log(pnlValue, price, positionPrice, collateralAmount);
          } else if (state.position === "TANK") {
            // For short positions: (entryPrice - currentPrice) * position size
            pnlValue = (positionPrice - price) * collateralAmount;
            console.log("pnlValue");
            console.log(pnlValue, price, positionPrice, collateralAmount);
          }

          setPnl(pnlValue);
        }

        // Reset price change indicator after animation
        setTimeout(() => setPriceChange(null), 1000);
      }
    });

    return () => {
      unsubscribeFromPriceFeeds();
    };
  }, [positionPrice]);

  useEffect(() => {
    const currentAbsPnl = Math.abs(pnl);
    if (currentAbsPnl > highestPnl) {
      setHighestPnl(currentAbsPnl);
      if (typeof window !== 'undefined') {
        localStorage.setItem('highestPnl', currentAbsPnl.toString());
      }
    }
  }, [pnl, highestPnl]);

  const getOrCreatePerpClient = async (): Promise<PerpetualsClient> => {
    if (flashPerpClient) {
      return flashPerpClient;
    }

    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: true,
    });
    setProvider(provider);

    // Initialize perpetuals client
    const newPerpClient = new PerpetualsClient(
      provider,
      POOL_CONFIGS[0].programId,
      POOL_CONFIGS[0].perpComposibilityProgramId,
      POOL_CONFIGS[0].fbNftRewardProgramId,
      POOL_CONFIGS[0].rewardDistributionProgram.programId,
      {}
    );

    await newPerpClient.loadAddressLookupTable(POOL_CONFIGS[0]);
    setFlashPerpClient(newPerpClient);

    return newPerpClient;
  };

  const openPosition = async () => {
    try {
      if (!publicKey) {
        // If no wallet is connected, trigger wallet connection
        try {
          console.log("wallets");
          console.log(wallets);
          try {
            select(PhantomWalletName);
            await connect(); // This comes from useWallet()
          } catch (error) {
            console.log("error", error);
          }

          // Wait for connection to complete
          if (!publicKey) {
            toast({
              title: "Connect Wallet",
              description: "Please connect your wallet to continue",
              className: "bg-[#ffe135] text-black border-2 border-[#ffe135]",
            });
            return;
          }
        } catch (error) {
          console.error("Error connecting wallet:", error);
          toast({
            variant: "destructive",
            title: "Wallet Connection Failed",
            description: "Failed to connect wallet. Please try again.",
            className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
          });
          return;
        }
      }

      if (!wallet) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to continue",
          className: "bg-[#ffe135] text-black border-2 border-[#ffe135]",
        });
        return;
      }

      // Set market based on position side
      let market;
      if (state.position === "MOON") {
        // Get long market
        market = Object.entries(marketInfo).find(
          ([, info]) => info.side === "long"
        )?.[0];
      } else if (state.position === "TANK") {
        // Get short market
        market = Object.entries(marketInfo).find(
          ([, info]) => info.side === "short"
        )?.[0];
      }

      if (!market) {
        throw new Error("Invalid position side or market not found");
      }

      // Set size from deposit amount in state
      const sizeUsd = state.depositAmount;
      const leverage = 5;

      const perpClient = await getOrCreatePerpClient();

      const positionInstructions = await openBonkPosition(
        perpClient,
        market,
        marketInfo[market].side as "long" | "short",
        sizeUsd,
        leverage,
        publicKey as PublicKey,
        marketInfo[market].pool
      );

      const collateralAmount = positionInstructions.collateralAmount;
      setCollateralAmount(Number(collateralAmount.toString()));

      console.log("collateralAmount");
      console.log(collateralAmount.toString());

      const addressLookupTablePublicKeys = positionInstructions.alts.map(
        (alt) => alt.key
      );

      // Show loading toast before transaction and store its dismiss function
      const { dismiss: dismissLoadingToast } = toast({
        title: `Loading ${state.position} position`,
        description: `Your $${state.depositAmount} position will be ready in a min`,
        className: "bg-[#ffe135] text-black border-2 border-[#ffe135]",
        duration: Infinity, // Keep the toast until we dismiss it
      });

      try {
        console.log("positionPrice");
        console.log(positionInstructions.positionPrice); // {price: BN, exponent: -10}
        setPositionPrice(positionInstructions.positionPrice);
        const signature = await createAndExecuteTransaction(
          connection,
          wallet,
          positionInstructions.instructions,
          addressLookupTablePublicKeys
        );

        // Dismiss the loading toast using the dismiss function
        dismissLoadingToast();

        console.log("signature", signature);
        state.isPositionOpen = true;

        // Show success toast
        toast({
          title: "Position Opened",
          description: `Successfully opened ${state.position} position for $${state.depositAmount} 🎉`,
          className:
            state.position === "MOON"
              ? "bg-[#2DE76E] text-black border-2 border-[#2DE76E]"
              : "bg-[#E72D36] text-white border-2 border-[#E72D36]",
        });
      } catch (error) {
        // Dismiss the loading toast using the dismiss function
        dismissLoadingToast();
        setPositionPrice(0);

        state.isPositionOpen = false;

        console.error("Failed to execute transaction:", error);
        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: `Transaction failed: ${error.message}`,
            className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            action: (
              <ToastAction
                altText="Try once more 🥺"
                onClick={() => openPosition()}
              >
                Try once more 🥺
              </ToastAction>
            ),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: "Transaction failed. Please try again.",
            className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            action: (
              <ToastAction
                altText="Try once more 🥺"
                onClick={() => openPosition()}
              >
                Try once more 🥺
              </ToastAction>
            ),
          });
        }
        state.isPositionOpen = false;
      }
    } catch (error) {
      console.error("Error opening position:", error);
      toast({
        variant: "destructive",
        title: "Error Opening Position",
        description: "Failed to open position. Please try again.",
        className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
        action: (
          <ToastAction
            altText="Try once more 🥺"
            onClick={() => openPosition()}
          >
            Try once more 🥺
          </ToastAction>
        ),
      });
    }
  };

  const closePosition = async () => {
    if (!state.isPositionOpen || isTransactionExecuting) {
      return;
    }

    if (!wallet) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to continue",
        className: "bg-[#ffe135] text-black border-2 border-[#ffe135]",
      });
      return;
    }

    try {
      setIsTransactionExecuting(true);
      state.isPositionOpen = false;
      setPositionPrice(0);

      let market;
      if (state.position === "MOON") {
        // Get long market
        market = Object.entries(marketInfo).find(
          ([, info]) => info.side === "long"
        )?.[0];
      } else if (state.position === "TANK") {
        // Get short market
        market = Object.entries(marketInfo).find(
          ([, info]) => info.side === "short"
        )?.[0];
      }

      if (!market) {
        throw new Error("Invalid position side or market not found");
      }

      const perpClient = await getOrCreatePerpClient();

      const { dismiss: dismissLoadingToast } = toast({
        title: `Closing ${state.position} position`,
        description: `Your $${state.depositAmount} position will be ready in a min`,
        className: "bg-[#ffe135] text-black border-2 border-[#ffe135]",
        duration: Infinity,
      });

      const closePositionInstructions = await closeBonkPosition(
        perpClient,
        market,
        marketInfo[market].side as "long" | "short",
        publicKey as PublicKey,
        marketInfo[market].pool
      );

      const addressLookupTablePublicKeys = closePositionInstructions.alts.map(
        (alt) => alt.key
      );

      try {
        const signature = await createAndExecuteTransaction(
          connection,
          wallet,
          closePositionInstructions.instructions,
          addressLookupTablePublicKeys
        );

        dismissLoadingToast();

        if (signature) {
          setPnl(0);
          toast({
            title: "Position Closed",
            description: `Successfully closed ${state.position} position for $${state.depositAmount} 🎉`,
            className:
              state.position === "MOON"
                ? "bg-[#2DE76E] text-black border-2 border-[#2DE76E]"
                : "bg-[#E72D36] text-white border-2 border-[#E72D36]",
          });
        }
      } catch (error) {
        dismissLoadingToast();
        state.isPositionOpen = true;

        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: `Transaction failed: ${error.message}`,
            className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            action: (
              <ToastAction
                altText="Try once more 🥺"
                onClick={() => {
                  setIsTransactionExecuting(false); // Reset state before retry
                  closePosition();
                }}
              >
                Try once more 🥺
              </ToastAction>
            ),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: "Transaction failed. Please try again.",
            className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            action: (
              <ToastAction
                altText="Try once more 🥺"
                onClick={() => {
                  setIsTransactionExecuting(false); // Reset state before retry
                  closePosition();
                }}
              >
                Try once more 🥺
              </ToastAction>
            ),
          });
        }
      }
    } catch (error) {
      state.isPositionOpen = true;
      console.error("Error closing position:", error);

      toast({
        variant: "destructive",
        title: "Error Closing Position",
        description: "Failed to close position. Please try again.",
        className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
        action: (
          <ToastAction
            altText="Try once more 🥺"
            onClick={() => {
              setIsTransactionExecuting(false); // Reset state before retry
              closePosition();
            }}
          >
            Try once more 🥺
          </ToastAction>
        ),
      });
    } finally {
      setIsTransactionExecuting(false);
    }
  };

  useEffect(() => {
    const checkPlayerStatus = () => {
      if (state.isPlayerDead !== isPlayerDead) {
        setIsPlayerDead(state.isPlayerDead);
      }
    };

    // Check status every 100ms
    const interval = setInterval(checkPlayerStatus, 100);
    return () => clearInterval(interval);
  }, [isPlayerDead]);

  useEffect(() => {
    if (isPlayerDead && state.isPositionOpen) {
      setShowGameOver(true);
      closePosition();
    }
  }, [isPlayerDead, pnl]);

  const formatPrice = (price: number) => {
    if (price === 0) return { base: "...", exponent: "" };

    // Convert to exponential notation
    const scientificStr = price.toExponential(5);
    const [base, exponent] = scientificStr.split("e");
    const formattedBase = Number(base).toFixed(5);
    return {
      base: formattedBase,
      // Extract just the number from the exponent (removing 'e-' or 'e+')
      exponent: exponent.replace("e", ""),
    };
  };

  const handlePositionSelect = (position: "MOON" | "TANK") => {
    state.position = position;
    if (depositAmount > 0 && !state.isPositionOpen) {
      openPosition();
    }
  };

  const handleDepositSelect = (amount: number) => {
    setDepositAmount(amount);
    state.depositAmount = amount; // Update game state

    if (state.position === "NONE") {
      toast({
        title: `BONK for $${amount}`,
        description: `You've selected BONK for $${amount} but yet to choose a position.`,
        className: "bg-[#ffe135] text-black border-2 border-[#ffe135]",
      });
      return;
    }

    if (!state.isPositionOpen) {
      openPosition();
    }

    toast({
      title: `Bonk ${
        state.position === "MOON" ? "LONG" : "SHORT"
      } for $${amount}`,
      description: `You've selected to ${
        state.position === "MOON" ? "long" : "short"
      } BONK for $${amount}.`,
      className:
        state.position === "MOON"
          ? "bg-[#2DE76E] text-black border-2 border-[#2DE76E]"
          : "bg-[#E72D36] text-white border-2 border-[#E72D36]",
    });
  };

  const formatPnl = (pnl: number) => {
    if (pnl === 0) return { base: "0.00000", exponent: "0" };

    // Convert to exponential notation
    const scientificStr = Math.abs(pnl).toExponential(5);
    const [base, exponent] = scientificStr.split("e");
    const formattedBase = Number(base).toFixed(5);
    return {
      base: formattedBase,
      exponent: exponent.replace("e", ""),
    };
  };

  const handleGameOverClose = () => {
    setShowGameOver(false);
    state.mode = "idle";
    state.modeStarted = false;
    state.isPlayerDead = false;
  };

  const borderVariants = {
    animate: {
      backgroundPosition: ["0% 0%", "200% 200%"],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#171B26] text-[#FFFCEA] p-4 flex items-center justify-center font-mono">
      <Card className="w-full max-w-6xl aspect-video bg-black rounded-3xl border-4 border-[#ffe135] p-4 grid grid-cols-[1fr,2fr,1fr] gap-4 shadow-[0_0_20px_rgba(255,225,53,0.5)]">
        <div className="flex flex-col justify-between relative">
          {/* MOON Button */}
          <Button
            variant="outline"
            className={`
              group
              relative
              h-1/2 text-4xl font-bold 
              transition-all duration-200
              transform perspective-1000
              ${
                state.position === "MOON"
                  ? "bg-[#2DE76E] text-black translate-y-1 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]"
                  : "bg-black text-[#2DE76E] hover:translate-y-1 shadow-[0_6px_0_#1a8641,0_10px_10px_rgba(0,0,0,0.4)]"
              }
              active:translate-y-1
              active:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]
              disabled:opacity-50
              font-arcade
              overflow-hidden
            `}
            onClick={() => handlePositionSelect("MOON")}
            disabled={state.isPositionOpen}
          >
            {state.position !== "TANK" && (
              <motion.div
                variants={borderVariants}
                animate="animate"
                className="absolute inset-[3px] rounded-lg border-[3px] border-transparent"
                style={{
                  background: "repeating-linear-gradient(-45deg, #2DE76E 0, #2DE76E 12px, transparent 12px, transparent 24px)",
                }}
              />
            )}
            <span className="relative z-10 bg-inherit rounded-md flex items-center justify-center w-full h-full">
              MOON
            </span>
          </Button>

          {/* TANK Button */}
          <Button
            variant="outline"
            className={`
              group
              relative
              h-1/2 text-4xl font-bold 
              transition-all duration-200
              transform perspective-1000
              ${
                state.position === "TANK"
                  ? "bg-[#E72D36] text-black translate-y-1 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]"
                  : "bg-black text-[#E72D36] hover:translate-y-1 shadow-[0_6px_0_#8f1c22,0_10px_10px_rgba(0,0,0,0.4)]"
              }
              active:translate-y-1
              active:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]
              disabled:opacity-50
              font-arcade
              overflow-hidden
            `}
            onClick={() => handlePositionSelect("TANK")}
            disabled={state.isPositionOpen}
          >
            {state.position !== "MOON" && (
              <motion.div
                variants={borderVariants}
                animate="animate"
                className="absolute inset-[3px] rounded-lg border-[3px] border-transparent"
                style={{
                  background: "repeating-linear-gradient(-45deg, #E72D36 0, #E72D36 12px, transparent 12px, transparent 24px)",
                }}
              />
            )}
            <span className="relative z-10 bg-inherit rounded-md flex items-center justify-center w-full h-full">
              TANK
            </span>
          </Button>
        </div>

        <div className="border-4 border-[#ffe135] rounded-xl overflow-hidden bg-[#171B26] flex items-center justify-center">
          <Game />
        </div>

        <div className="flex flex-col">
          <Card className="flex-1 bg-black border-2 border-[#ffe135] p-4 mb-2 overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-[#ffe135]">
              Instructions
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-[#FFFCEA]">
              <li>Choose a side MOON or TANK</li>
              <li>
                Sign a transaction open a position (long/short) on flashtrade
              </li>
              <li>Fly through the price candles using spacebar</li>
              <li>If you fall you LOSE (position close)</li>
            </ol>
          </Card>

          <Card className="bg-black border-2 border-[#ffe135] p-4 mb-2">
            <h2 className="text-xl font-bold mb-2 text-[#ffe135]">
              Select Amount
            </h2>
            <div className="flex justify-between gap-3">
              {[5, 10, 20].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDepositSelect(amount)}
                  className={`
                    group
                    relative
                    flex-1 px-3 py-2 text-xl font-bold
                    border-2 rounded-lg
                    transition-all duration-100
                    transform perspective-1000
                    ${
                      depositAmount === amount
                        ? "bg-[#ffe135] text-black translate-y-1 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]"
                        : "bg-black text-[#ffe135] hover:translate-y-1 shadow-[0_4px_0_#b39b24,0_6px_8px_rgba(0,0,0,0.4)]"
                    }
                    ${
                      depositAmount === amount
                        ? "before:bg-[repeating-linear-gradient(-45deg,#ffe135_0,#ffe135_12px,transparent_12px,transparent_24px)] before:bg-[length:200%_200%] before:animate-roll-yellow"
                        : ""
                    }
                    before:content-['']
                    before:absolute
                    before:inset-0
                    before:m-[3px]
                    before:rounded-lg
                    before:border-[3px]
                    before:border-transparent
                  `}
                >
                  <span className="relative z-10 bg-inherit rounded-md flex items-center justify-center w-full h-full">
                    ${amount}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-black border-2 border-[#ffe135] p-4 mb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#ffe135]">PNL</h2>
              <div className="relative flex items-baseline">
                <span
                  className={`text-3xl ${
                    pnl >= 0 ? "text-[#2DE76E]" : "text-[#E72D36]"
                  }`}
                >
                  {pnl >= 0 ? "+" : "-"}${pnl.toFixed(5)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-black border-2 border-[#ffe135] p-4">
            <div className="flex items-center justify-between gap-4">
              <Image
                src={bonkTokenImage}
                alt="Bonk Token"
                width={56}
                height={56}
                className="rounded-full"
              />
              <div className="flex flex-col items-end">
                <div className="relative flex items-baseline">
                  <span className="absolute -top-2 -right-4 text-sm text-[#FFFCEA]">
                    {formatPrice(tokenPrice).exponent}
                  </span>
                  <span
                    className={`text-3xl transition-colors duration-300 ${
                      priceChange === "up"
                        ? "text-[#2DE76E]"
                        : priceChange === "down"
                        ? "text-[#E72D36]"
                        : "text-[#FFFCEA]"
                    }`}
                  >
                    ${formatPrice(tokenPrice).base}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
      <Toaster />
      <GameOver
        isOpen={showGameOver}
        onClose={handleGameOverClose}
        score={pnl}
        highScore={highestPnl}
      />
    </div>
  );
};

export default Home;
