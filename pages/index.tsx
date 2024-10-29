import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Game from '@/components/Game'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import state from '@/game/gameState'
import bonkTokenImage from '@/public/bonkToken.jpg'
import { PythPriceEntry, subscribeToPriceFeeds, unsubscribeFromPriceFeeds } from '@/components/pythPricing/pythPricing'
import openBonkPosition from '@/components/trade/openBonkPosition'
import closeBonkPosition from '@/components/trade/closeBonkPosition'

const Home: NextPage = () => {
  const [pnl, setPnl] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(0)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    let lastPrice = 0;
    
    subscribeToPriceFeeds((symbol, priceEntry: PythPriceEntry) => {
      if (priceEntry.price && !priceEntry.isStale) {
        const price = priceEntry.price.price * (10 ** priceEntry.price.exponent)
        setTokenPrice(price)
        setPriceChange(price > lastPrice ? 'up' : 'down')
        lastPrice = price
        
        // Reset price change indicator after animation
        setTimeout(() => setPriceChange(null), 1000)
      }
    })

    return () => {
      unsubscribeFromPriceFeeds()
    }
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return { base: '...', exponent: '' }
    
    // Convert to exponential notation
    const scientificStr = price.toExponential(5)
    const [base, exponent] = scientificStr.split('e')
    const formattedBase = Number(base).toFixed(5)
    return {
      base: formattedBase,
      // Extract just the number from the exponent (removing 'e-' or 'e+')
      exponent: exponent.replace('e', '')
    }
  }

  const handlePositionSelect = (position: 'MOON' | 'TANK') => {
    state.position = position;
    if (depositAmount > 0 && !state.isPositionOpen) {
      openBonkPosition();
      state.isPositionOpen = true;
    }
  }

  const handleDepositSelect = (amount: number) => {
    setDepositAmount(amount)
    
    if (state.position === 'NONE') {
      toast({
        title: `BONK for $${amount}`,
        description: `You've selected BONK for $${amount} but yet to choose a position.`,
        className: 'bg-[#ffe135] text-black border-2 border-[#ffe135]',
      })
      return
    }

    if (!state.isPositionOpen) {
      openBonkPosition();
      state.isPositionOpen = true;
    }

    toast({
      title: `Bonk ${state.position === 'MOON' ? 'LONG' : 'SHORT'} for $${amount}`,
      description: `You've selected to ${state.position === 'MOON' ? 'long' : 'short'} BONK for $${amount}.`,
      className: state.position === 'MOON' 
        ? 'bg-[#2DE76E] text-black border-2 border-[#2DE76E]' 
        : 'bg-[#E72D36] text-white border-2 border-[#E72D36]',
    })
  }

  return (
    <div className="min-h-screen bg-[#171B26] text-[#FFFCEA] p-4 flex items-center justify-center font-mono">
      <Card className="w-full max-w-6xl aspect-video bg-black rounded-3xl border-4 border-[#ffe135] p-4 grid grid-cols-[1fr,2fr,1fr] gap-4 shadow-[0_0_20px_rgba(255,225,53,0.5)]">
        <div className="flex flex-col justify-between">
          <Button 
            variant="outline" 
            className={`h-1/2 text-4xl font-bold text-[#2DE76E] border-4 border-[#2DE76E] hover:bg-[#2DE76E] hover:text-black transition-colors ${state.position === 'MOON' ? 'bg-[#2DE76E] text-black' : ''}`}
            onClick={() => handlePositionSelect('MOON')}
          >
            MOON
          </Button>
          <Button 
            variant="outline" 
            className={`h-1/2 text-4xl font-bold text-[#E72D36] border-4 border-[#E72D36] hover:bg-[#E72D36] hover:text-black transition-colors ${state.position === 'TANK' ? 'bg-[#E72D36] text-black' : ''}`}
            onClick={() => handlePositionSelect('TANK')}
          >
            TANK
          </Button>
        </div>

        <div className="border-4 border-[#ffe135] rounded-xl overflow-hidden bg-[#171B26] flex items-center justify-center">
          <Game />
        </div>

        <div className="flex flex-col">
          <Card className="flex-1 bg-black border-2 border-[#ffe135] p-4 mb-2 overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-[#ffe135]">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-[#FFFCEA]">
              <li>Choose a side MOON or TANK</li>
              <li>Sign a transaction open a position (long/short) on flashtrade</li>
              <li>Fly through the price candles using spacebar</li>
              <li>If you fall you LOSE (position close)</li>
            </ol>
          </Card>
          
          <Card className="bg-black border-2 border-[#ffe135] p-4 mb-2">
            <h2 className="text-xl font-bold mb-2 text-[#ffe135]">Select Amount</h2>
            <div className="flex justify-between gap-2">
              {[5, 10, 20].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDepositSelect(amount)}
                  className={`
                    flex-1 px-4 py-2 text-xl font-bold
                    border-2 border-[#ffe135] rounded-lg
                    ${depositAmount === amount 
                      ? 'bg-[#ffe135] text-black' 
                      : 'bg-black text-[#ffe135]'}
                    hover:bg-[#ffe135] hover:text-black
                    transition-all duration-200
                    shadow-[0_0_10px_rgba(255,225,53,0.3)]
                    hover:shadow-[0_0_20px_rgba(255,225,53,0.5)]
                    active:transform active:scale-95
                    font-arcade
                  `}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-black border-2 border-[#ffe135] p-4 mb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#ffe135]">PNL</h2>
              <p className={`text-3xl ${pnl >= 0 ? 'text-[#2DE76E]' : 'text-[#E72D36]'}`}>
                {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
              </p>
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
                  <span className={`text-3xl transition-colors duration-300 ${
                    priceChange === 'up' ? 'text-[#2DE76E]' : 
                    priceChange === 'down' ? 'text-[#E72D36]' : 'text-[#FFFCEA]'
                  }`}>
                    ${formatPrice(tokenPrice).base}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
      <Toaster />
    </div>
  )
}

export default Home
