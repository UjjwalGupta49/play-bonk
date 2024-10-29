export type Position = 'NONE' | 'MOON' | 'TANK';

// Create state variables
let state = {
    mode: 'idle', //play, dead, idle
    modeStarted: false, 
    position: 'NONE' as Position,
    isPositionOpen: false,
    inGameState: {
        currentScore: 0,
        distanceSinceSpawn: 0,
        totalDistance: 0,
        onGround: false,
    },
    history: {
        highScore: 0,
    },
}
export default state;