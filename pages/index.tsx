import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Game from '@/components/Game'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Circle } from 'lucide-react'

const Home: NextPage = () => {
  const [pnl, setPnl] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(420.52)

  useEffect(() => {
    // Simulating price updates
    const interval = setInterval(() => {
      setTokenPrice(prev => +(prev + (Math.random() - 0.5) * 2).toFixed(2))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#171B26] text-[#FFFCEA] p-4 flex items-center justify-center font-mono">
      <Card className="w-full max-w-6xl aspect-video bg-black rounded-3xl border-4 border-[#ffe135] p-4 grid grid-cols-[1fr,2fr,1fr] gap-4 shadow-[0_0_20px_rgba(255,225,53,0.5)]">
        <div className="flex flex-col justify-between">
          <Button 
            variant="outline" 
            className="h-1/2 text-4xl font-bold text-[#2DE76E] border-4 border-[#2DE76E] hover:bg-[#2DE76E] hover:text-black transition-colors"
          >
            MOON
            <ArrowUp className="ml-2 h-8 w-8" />
          </Button>
          <Button 
            variant="outline" 
            className="h-1/2 text-4xl font-bold text-[#E72D36] border-4 border-[#E72D36] hover:bg-[#E72D36] hover:text-black transition-colors"
          >
            TANK
            <ArrowDown className="ml-2 h-8 w-8" />
          </Button>
        </div>

        <div className="border-4 border-[#ffe135] rounded-xl overflow-hidden bg-[#171B26] flex items-center justify-center">
          <Game />
        </div>

        <div className="flex flex-col">
          <Card className="flex-1 bg-black border-2 border-[#ffe135] p-4 mb-2 overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-[#ffe135]">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-[#FFFCEA]">
              <li>Choose a side MOON or TANK????</li>
              <li>Sign a transaction open a position (long/short) on flashtrade</li>
              <li>Fly through the price candles using spacebar</li>
              <li>If you fall you LOSE (position close)</li>
            </ol>
          </Card>
          
          {/* Updated PNL card with flex layout */}
          <Card className="bg-black border-2 border-[#ffe135] p-4 mb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#ffe135]">PNL</h2>
              <p className={`text-3xl ${pnl >= 0 ? 'text-[#2DE76E]' : 'text-[#E72D36]'}`}>
                {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
              </p>
            </div>
          </Card>

          {/* Updated Token Price card with reversed layout and larger icon */}
          <Card className="bg-black border-2 border-[#ffe135] p-4">
            <div className="flex items-center justify-end gap-4">
            <Circle className="h-10 w-10 text-[#ffe135]" />
              <p className="text-3xl text-[#FFFCEA]">${tokenPrice.toFixed(2)}</p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}

export default Home
