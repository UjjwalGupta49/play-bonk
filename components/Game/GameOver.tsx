import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"

interface GameOverProps {
  isOpen: boolean
  onClose: () => void
  score: number
  highScore: number
}

export function GameOver({ isOpen, onClose, score, highScore }: GameOverProps) {
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  useEffect(() => {
    setIsNewHighScore(score > highScore)
  }, [score, highScore])

  const formatUSD = (value: number) => {
    const scientificStr = Math.abs(value).toExponential(5);
    const [base, exponent] = scientificStr.split('e');
    const formattedBase = Number(base).toFixed(5);
    
    return {
      base: formattedBase,
      exponent: exponent.replace('+', '')
    };
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        bg-[#171B26] 
        border-4 border-[#ffe135] 
        text-[#FFFCEA] 
        sm:max-w-md 
        rounded-xl 
        shadow-[0_0_20px_rgba(255,225,53,0.5)]
        transform perspective-1000
        animate-in
        zoom-in-95
        duration-300
      ">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className={`
              relative
              font-arcade 
              text-4xl 
              ${score >= 0 ? 'text-[#2DE76E]' : 'text-[#E72D36]'}
              drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
              before:content-['']
              before:absolute
              before:top-0
              before:left-0
              before:w-full
              before:h-full
              before:bg-[linear-gradient(rgba(255,255,255,0.1),transparent)]
              animate-pulse
            `}>
              {score >= 0 ? '$ WON $' : 'BONKED !!!'}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 p-6">
          <div className="
            relative
            bg-black/80 
            border-2 
            border-[#ffe135] 
            rounded-lg 
            p-6 
            w-full 
            space-y-4
            shadow-[inset_0_2px_4px_rgba(255,225,53,0.2)]
            overflow-hidden
          ">
            {/* PNL Section */}
            <div className="text-center">
              <h3 className="font-arcade text-[#ffe135] mb-2 text-xl">FINAL PNL</h3>
              <div className="relative flex justify-center items-baseline">
                <p className={`
                  font-arcade 
                  text-2xl
                  ${score >= 0 ? 'text-[#2DE76E]' : 'text-[#E72D36]'}
                  drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                `}>
                  {score >= 0 ? '+' : '-'}${Math.abs(score).toFixed(5)}
                </p>
              </div>
            </div>
            
            {/* Highest PNL Section */}
            <div className="text-center relative">
              <h3 className="font-arcade text-[#ffe135] mb-2 text-xl">HIGHEST PNL</h3>
              <div className="relative flex justify-center items-baseline">
                <p className={`
                  font-arcade 
                  text-2xl
                  ${highScore >= 0 ? 'text-[#2DE76E]' : 'text-[#E72D36]'}
                  drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                `}>
                  {highScore >= 0 ? '+' : '-'}${Math.abs(highScore).toFixed(5)}
                </p>
              </div>
              {isNewHighScore && (
                <>
                  <Sparkles className="
                    absolute 
                    -top-1 
                    -right-1 
                    text-[#ffe135] 
                    animate-spin
                  " />
                  <div className="
                    absolute 
                    -inset-[2px] 
                    rounded-lg
                    animate-pulse
                    bg-[radial-gradient(circle,rgba(255,225,53,0.4)_0%,transparent_70%)]
                  " />
                </>
              )}
            </div>
          </div>

          {/* Play Again Button */}
          <Button 
            onClick={onClose}
            className="
              group
              relative
              font-arcade 
              bg-black 
              text-[#ffe135]
              border-4 
              border-[#ffe135]
              px-8 
              py-4 
              text-xl
              transition-all 
              duration-200
              transform 
              perspective-1000
              hover:translate-y-1
              hover:bg-black
              shadow-[0_6px_0_#b39b24,0_10px_10px_rgba(0,0,0,0.4)]
              active:translate-y-1
              active:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]
              before:content-['']
              before:absolute
              before:top-0
              before:left-0
              before:w-full
              before:h-full
              before:bg-[linear-gradient(rgba(255,255,255,0.1),transparent)]
              overflow-hidden
            "
          >
            <span className="relative z-10">TRADE AGAIN</span>
            <div className="
              absolute 
              inset-0 
              bg-[linear-gradient(rgba(255,255,255,0.2),transparent)] 
              opacity-0 
              group-hover:opacity-100 
              transition-opacity
            " />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}