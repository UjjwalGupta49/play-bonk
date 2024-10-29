import { toast } from "@/hooks/use-toast"
import { Position } from "@/game/gameState"

export function useGameToast() {
  const showPositionRequiredToast = () => {
    toast({
      variant: "destructive",
      title: "Position Required",
      description: "Choose MOON or TANK to start the game!",
      className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
    })
  }

  const showPositionSelectedToast = (position: Position) => {
    if (position === 'NONE') return

    toast({
      title: "Position Selected",
      description: `You chose to ${position === 'MOON' ? 'LONG' : 'SHORT'} the position`,
      className: position === 'MOON' 
        ? 'bg-[#2DE76E] text-black border-2 border-[#2DE76E]' 
        : 'bg-[#E72D36] text-white border-2 border-[#E72D36]',
    })
  }

  return {
    showPositionRequiredToast,
    showPositionSelectedToast,
  }
} 