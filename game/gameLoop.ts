import { Sprite, Text, Texture, Container, BaseTexture, Rectangle, TilingSprite, Renderer, Graphics } from 'pixi.js'
import { toast } from "@/hooks/use-toast"

import { titleTextStyle, scoreTextStyle } from '@/styles/textStyles'
import { floorCollides, pipeCollides } from '@/game/collision'
import { Player } from '@/game/players'
import constants from '@/game/constants'
import { Pipe } from '@/game/pipe'
import state from '@/game/gameState'
import ScoreCard from '@/game/scoreCard'
import parallaxBackground from '@/game/parallaxBackground'
import { PriceBufferService } from './services/PriceBufferService';

// Replace the image imports with direct paths
const playerImg = '/assets/bonk.png'
const groundImg = '/assets/floor.png'
const pipeImg = '/assets/pipe.png'

const bullishCandleImg = '/assets/bullishCandle.png'
const bearishCandleImg = '/assets/bearishCandle.png'

function getGameUpdateFuncs(stage : Container, renderer: Renderer, onPositionRequired?: () => void) {
    // Initialize price service
    const priceService = PriceBufferService.getInstance();
    
    // Create container for pipes
    const pipeLayer = new Container();

    // Creating the player components
    const graphic = Sprite.from(playerImg as string);
    graphic.width = constants['player']['width'];
    graphic.height = constants['player']['height'];
    const hitbox = new Sprite();
    hitbox.width = constants['player']['hitboxWidth'];
    hitbox.height = constants['player']['hitboxHeight'];
    const player = new Player(graphic, hitbox);

    // Create ground sprite
    const gndTex = Texture.from(groundImg as string);
    const ground = new TilingSprite(gndTex);
    ground.width = constants['gameWidth'];
    ground.height = 20;
    ground.anchor.set(0,1);
    ground.x = 0;
    ground.y = constants['gameHeight'];

    //Create background
    const background = new parallaxBackground();

    // Create pipe texture
    const pipeTexture = Texture.from(pipeImg as string);
    const bullishTexture = Texture.from(bullishCandleImg as string);
    const bearishTexture = Texture.from(bearishCandleImg as string);


    let pipes : Pipe[] = [];
    let playClick = (event : any) => {
        player.setVelocity(-10);
    }

    let idleClick = (event : any) => {
        if (!validateGameStart()) {
            return;
        }
        
        state.modeStarted = false;
        state.mode = 'play';
    }

    const validateGameStart = () => {
        if (state.position === 'NONE') {
            toast({
                title: "Position Required",
                description: "Please select MOON or TANK position first",
                className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            })
            return false;
        }

        if (!state.depositAmount) {
            toast({
                title: "Deposit Required",
                description: "Please select a deposit amount ($5, $10, or $20)",
                className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            })
            return false;
        }

        if (!state.isPositionOpen) {
            toast({
                title: "Position Not Open",
                description: "Please wait for your position to be opened",
                className: "bg-black border-2 border-[#ffe135] text-[#FFFCEA]",
            })
            return false;
        }

        return true;
    }

    function idleUpdate(delta : number) {
        if (!state['modeStarted']){
            // Reset player death state when game resets
            state.isPlayerDead = false;
            
            stage.removeChildren();
            pipeLayer.removeChildren();
            const clickableArea = new Sprite();
            clickableArea.width = renderer.screen.width;
            clickableArea.height = renderer.screen.height;
            clickableArea.interactive = true;
            stage.addChild(clickableArea)

            background.resetBackgroundPosition();
            ground.tilePosition.x = 0;
            stage.addChild(background);

            stage.addChild(pipeLayer);

            document.removeEventListener('keypress', deathClick);
            document.removeEventListener('keypress', playClick);

            clickableArea.on('pointerdown', idleClick);
            document.addEventListener('keypress', idleClick);

            player.setVelocity(-5);
            player.rotation = 0;
            stage.addChild(player);

            player.x = 140
            player.y = .35*constants['gameHeight'];

            stage.addChild(ground);

            state['modeStarted'] = true;
        }
        player.undulateUpdate(delta, .35*constants['gameHeight']);

        background.updateBackground(delta);
        ground.tilePosition.x -= delta*constants['moveSpeed'];
    }

    // let scoreText : Text;
    function playUpdate(delta : number) {
        if (!state['modeStarted']){
            state['inGameState']['totalDistance'] = 0;
            state['inGameState']['distanceSinceSpawn'] = 0



            const clickableArea = stage.getChildAt(0);
            clickableArea.removeAllListeners();


            // scoreText = new Text('0', scoreTextStyle);
            // scoreText.x = constants['gameWidth']/2.0 - (scoreText.width/2.0);
            // scoreText.y = constants['gameHeight']*.1;

            // stage.addChild(scoreText);

            document.removeEventListener('keypress', deathClick);
            document.removeEventListener('keypress', idleClick);

            clickableArea.on('pointerdown', playClick);
            document.addEventListener('keypress', playClick);
            state['inGameState']['onGround'] = false;

            player.setVelocity(-5);
            stage.addChild(player);

            stage.addChild(ground);

            state['modeStarted'] = true;
        }

        state['inGameState']['currentScore'] = Math.floor(Math.max(0, (state['inGameState']['totalDistance']-constants['gameWidth']-constants['player']['hitboxWidth'])/constants['pipes']['distancePerSpawn']))
        // scoreText.text = state['inGameState']['currentScore'];
        player.updatePhysics(delta, .5, 25);
        state['inGameState']['distanceSinceSpawn'] += delta*constants['moveSpeed'];
        state['inGameState']['totalDistance'] += delta*constants['moveSpeed'];


        if(state['inGameState']['distanceSinceSpawn'] > constants['pipes']['distancePerSpawn']) {
            const latestCandle = priceService.getLatestCandle();
            if (latestCandle) {
                const p = new Pipe(bullishTexture, bearishTexture, latestCandle);
                pipeLayer.addChild(p);
                pipes.push(p);
                state['inGameState']['distanceSinceSpawn'] -= constants['pipes']['distancePerSpawn'];
            }
        }


        let collided = false

        if (floorCollides(player, ground)){
            state['mode'] = 'dead';
            state['modeStarted'] = false;
            state['inGameState']['onGround'] = true;
            pipes = []
            collided = true
            player.y = ground.y - player.getGraphicBounds().height/3.0;
            console.log('collideGround');
        }

        // Check for pipe collision and update positions
        pipes = pipes.filter((pipe) => {
            if ( pipeCollides(player, pipe)){
                console.log('collidePipe')
                state['mode'] = 'dead';
                state['modeStarted'] = false;
                player.setVelocity(.1);
                pipes = [];
                collided = true
            }
            pipe.updatePosition(delta);

            if( pipe.getBounds().right < 0){
                stage.removeChild(pipe);
                pipe.destroy();
                return false;
            }
            return true;
        });

        if(collided){
            pipes = []
        }

        background.updateBackground(delta);
        ground.tilePosition.x -= delta*constants['moveSpeed'];
    }

    let deathClick = (event : any) => {
        state['mode'] = 'idle';
        state['modeStarted'] = false;
    }
    const scoreCard = new ScoreCard();
    function deadUpdate(delta: number) {
        if (!state['modeStarted']) {
            state.isPlayerDead = true;
            
            const clickableArea = stage.getChildAt(0);
            clickableArea.removeAllListeners();
            document.removeEventListener('keypress', playClick);

            // Update high score
            state['history']['highScore'] = Math.max(
                state['history']['highScore'], 
                state['inGameState']['currentScore']
            );
            localStorage.setItem('highScore', state['history']['highScore'].toString());

            state['modeStarted'] = true;
        }

        if(!state['inGameState']['onGround']){
            player.updatePhysics(delta, .5, 25);

            if (floorCollides(player, ground)){
                player.setVelocity(.1);
                state['inGameState']['onGround'] = true;
                player.y = ground.y - player.getGraphicBounds().height/3.0;
            }
        }
    }

    return [playUpdate, deadUpdate, idleUpdate];
}


function createGameUpdate(stage : Container, renderer: Renderer, onPositionRequired?: () => void) {
    let [playUpdate, deadUpdate, idleUpdate] = getGameUpdateFuncs(stage, renderer, onPositionRequired);

    state['history']['highScore'] = Number(localStorage.getItem('highScore'));

    if (isNaN(state['history']['highScore'])){
        state['history']['highScore'] = 0;
    }

    function gameUpdate(delta : number) {
        if (state['mode'] == 'idle') {
            idleUpdate(delta);
        }
        if (state['mode'] == 'play'){
            playUpdate(delta);
        }
        if (state['mode'] == 'dead'){
            deadUpdate(delta);
        }
    }
    return gameUpdate;
}


export { createGameUpdate };
